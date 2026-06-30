from flask import Flask, request, jsonify
from predict import predict

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'service': 'CareerKraft ML Engine'})

@app.route('/generate-roadmap', methods=['POST'])
def generate_roadmap():
    data = request.get_json() or {}
    career = data.get('career')
    experience = data.get('experience')
    skills = data.get('skills', '')
    hours_per_day = data.get('hoursPerDay')

    if not career or not experience or hours_per_day is None:
        return jsonify({
            'success': False,
            'message': 'career, experience, hoursPerDay are required',
        }), 400

    try:
        roadmap = predict(career, experience, skills, int(hours_per_day))
        return jsonify({'success': True, 'data': roadmap}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
