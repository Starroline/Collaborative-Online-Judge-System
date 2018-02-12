import docker
import os
import shutil
import uuid

from docker.errors import APIError
from docker.errors import ContainerError
from docker.errors import ImageNotFound

CURRENT_DIR = os.path.dirname(os.path.relpath(__file__)) # we are using relative path, since path is different on different machines
IMAGE_NAME = 'starroline/cs503-1705'
client = docker.from_env()

TEMP_BUILD_DIR = "%s/tmp/" % CURRENT_DIR # we will delete the folder after building
CONTAINER_NAME = "%s:latest" % IMAGE_NAME # we need to load those images

SOURCE_FILE_NAMES = {
    "java": "Solution.java",
    "python": "solution.py" # we used python at front-end, actually it is python3
}
BINARY_NAMES = { # binary_name is the name after building
    "java": "Solution",
    "python": "solution.py"
}

BUILD_COMMANDS = { # build command
    "java": "javac",
    "python": "python3"
}
EXECUTE_COMMANDS = { # execute command
    "java": "java",
    "python": "python3"
}

def load_image():
    try:
        client.images.get(IMAGE_NAME) # see if the image can be found locally
        print("Image exists locally.")
    except ImageNotFound: # image doesn't exist locally
        print("Image not found locally. Loading from docker.")
        client.images.pull(IMAGE_NAME) # pull it from dockerhub
    except APIError: # it failed to pull from dockerhub
        print("Errors occur when trying to pull from docker hub.")
        return
    print("Image successfully loaded.")

def make_dir(dir): # try to build unique id directory
    try: # when it's related to IO, we need to try catch
        os.mkdir(dir)
    except OSError:
        print("Errors occur when making directory.")

def submitresults(code, lang): # build and run 
    result = {'build': None, 'run': None, 'error': None} # test result can be added here as well
    source_file_parent_dir_name = uuid.uuid4() # generate unique id
    source_file_host_dir = "%s/%s" % (TEMP_BUILD_DIR, source_file_parent_dir_name) # host machine directory
    source_file_guest_dir = "/test/%s" % (source_file_parent_dir_name) # docker directory
    make_dir(source_file_host_dir) 

    # we got the code from user, we need to write the code to our file system
    with open("%s/%s" %(source_file_host_dir, SOURCE_FILE_NAMES[lang]), 'w') as source_file:
        source_file.write(code) 

    try: # we ask docker to build the code
        client.containers.run(
            image=IMAGE_NAME,
            command="%s %s" % (BUILD_COMMANDS[lang], SOURCE_FILE_NAMES[lang]), # command depends on your language
            volumes={source_file_host_dir: {'bind': source_file_guest_dir, 'mode': 'rw'}}, # rw meands read and write
            working_dir=source_file_guest_dir
        )
        print('source built successfully')
        result['build'] = 'OK'
    except ContainerError as e: # build failed
        result['build'] = str(e.stderr, 'utf-8') 
        shutil.rmtree(source_file_host_dir) # delete the file
        return result # return the result in string type
    
    try: # run the code
        log = client.containers.run( 
            image=IMAGE_NAME,
            command="%s %s" % (EXECUTE_COMMANDS[lang], BINARY_NAMES[lang]),
            volumes={source_file_host_dir: {'bind': source_file_guest_dir, 'mode': 'rw'}},
            working_dir=source_file_guest_dir
        )
        log = str(log, 'utf-8')
        result['run'] = log # run successfully
    except ContainerError as e: # run time error
        result['run'] = str(e.stderr, 'utf-8')
        shutil.rmtree(source_file_host_dir) # delete the file
        return result

    shutil.rmtree(source_file_host_dir) # even though the code ran successfully, we still have to delete it in the end
    return result

    # we need to call this from server