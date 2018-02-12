import json
from flask import Flask
app = Flask(__name__)
from flask import jsonify
from flask import request
import executor_utils as eu 

@app.route('/')
def hello():
    return 'hello world'

@app.route('/submitresults', methods=['POST'])
def submitresults():
    data = request.get_json()
    if 'code' not in data or 'lang' not in data:
        return 'You should provide "code" and "lang"'
    code = data['code']
    lang = data['lang']
    print("API got called with code: %s in %s" % (code, lang))
    # return jsonify({'build': 'build aaa', 'run': 'run from bbb'})
    result = eu.submitresults(code, lang)
    return jsonify(result)

if __name__ == '__main__':
    eu.load_image()
    app.run(debug=True) 
    # debug=True should be deleted when it goes to production