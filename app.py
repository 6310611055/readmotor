from flask import Flask, jsonify, render_template, request

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/filename', methods=['POST'])
def addFileName():
    data = request.get_json()
    name = data.get('name')
    date = data.get('date')
    # Process the data as needed
    # ...

    # Return a response
    response = {
        'Status': 'Success',
        'fileName': name
    }
    return jsonify(response)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
