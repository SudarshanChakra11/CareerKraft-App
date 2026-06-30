import pandas as pd
import numpy as np
from joblib import load

MODEL_PATH = 'models/roadmap_model.joblib'


def load_model():
    return load(MODEL_PATH)


def build_learning_params(experience, hours_per_day):
    base_weeks = {
        'Beginner': 16,
        'Intermediate': 12,
        'Advanced': 8,
    }

    weeks = base_weeks.get(experience, 16)
    if hours_per_day >= 4:
        weeks = max(6, weeks - 4)
    elif hours_per_day <= 2:
        weeks = weeks + 2

    pace = 'normal'
    if experience == 'Intermediate':
        pace = 'moderate'
    elif experience == 'Advanced':
        pace = 'fast'

    intensity = 1.0
    if hours_per_day >= 5:
        intensity = 1.8
    elif hours_per_day >= 4:
        intensity = 1.4
    elif hours_per_day <= 2:
        intensity = 0.8

    return {
        'totalMonthsRemaining': int(np.round(weeks / 4)),
        'monthsPerPhase': int(np.ceil((weeks / 4) if weeks >= 8 else 2)),
        'intensityMultiplier': intensity,
        'learningPace': pace,
        'focusArea': 'practical mastery',
        'totalWeeks': weeks,
    }


def build_phases(career, experience, skills, params):
    phase_titles = [
        f'Phase 1: Fundamentals of {career}',
        f'Phase 2: Applied {career} Skills',
        f'Phase 3: Advanced {career} Practice',
        f'Phase 4: Career and Interview Ready',
    ]

    return [
        {
            'phaseNumber': i + 1,
            'duration': f"{params['monthsPerPhase']} months",
            'title': phase_titles[i],
            'focus': ['Foundations', 'Implementation', 'Optimization', 'Placement'][i],
            'objectives': [
                f'Learn core {career} concepts',
                f'Build practical {career} projects',
                'Practice real-world scenarios',
            ],
            'topics': [
                {
                    'name': f'{career} topic {i + 1}',
                    'duration': '2 weeks',
                    'subtopics': [
                        f'{career} concept 1',
                        f'{career} concept 2',
                    ],
                    'resources': [
                        f'{career} guide',
                        'Online tutorial',
                    ],
                },
            ],
            'weeklyTasks': [
                {
                    'week': j + 1,
                    'goals': [
                        f'Complete task {j + 1}',
                        f'Review {career} material',
                    ],
                    'assignments': [
                        f'{career} assignment {j + 1}',
                    ],
                }
                for j in range(2)
            ],
            'projects': [f'{career} mini project {i + 1}'],
            'skills': [skill.strip() for skill in skills.split(',') if skill.strip()] or [career],
        }
        for i in range(4)
    ]


def build_daily_breakdown(phases, params):
    daily = []
    total_days = params['totalWeeks'] * 7
    for day in range(1, total_days + 1):
        phase_index = min((day - 1) // max(1, int(total_days / 4)), 3)
        phase = phases[phase_index]
        daily.append({
            'day': day,
            'phase': phase['phaseNumber'],
            'topic': phase['title'],
            'tasks': [
                {
                    'taskId': f'task_{day}_001',
                    'description': f'Complete study session for day {day}',
                    'duration': '45 minutes',
                    'type': 'practical' if day % 2 == 0 else 'theory',
                    'resources': [
                        f'{phase["title"]} resource',
                    ],
                },
            ],
            'practiceProblems': min(10, 3 + day // 7),
            'estimatedXP': 50 + (day % 30),
            'completionStatus': 'pending',
        })
    return daily


def build_milestones(career, params):
    return [
        {
            'month': 1,
            'milestone': f'Finish core {career} fundamentals',
            'expectedSkills': [f'{career} basics'],
            'projects': [f'{career} foundation project'],
            'completed': False,
        },
        {
            'month': params['monthsPerPhase'] * 2,
            'milestone': f'Build an intermediate {career} project',
            'expectedSkills': [f'{career} implementation skills'],
            'projects': [f'{career} intermediate project'],
            'completed': False,
        },
        {
            'month': params['monthsPerPhase'] * 3,
            'milestone': f'Complete advanced {career} topics',
            'expectedSkills': [f'{career} advanced problem solving'],
            'projects': [f'{career} advanced capstone'],
            'completed': False,
        },
    ]


def build_recommended_resources(career):
    return {
        'books': [f'{career} Handbook', 'Practical Learning Guide'],
        'courses': [f'{career} Foundations', f'{career} Advanced Training'],
        'websites': ['https://example.com', 'https://devdocs.io'],
        'tools': ['VS Code', 'Git'],
    }


def make_structured_roadmap(career, experience, skills, hours_per_day):
    learning_params = build_learning_params(experience, hours_per_day)
    phases = build_phases(career, experience, skills, learning_params)
    daily_breakdown = build_daily_breakdown(phases, learning_params)
    milestones = build_milestones(career, learning_params)

    return {
        'career': career,
        'experience': experience,
        'hoursPerDay': hours_per_day,
        'studentProfile': {
            'careerInterest': career,
            'experience': experience,
            'skills': skills,
        },
        'learningParams': learning_params,
        'phases': phases,
        'dailyBreakdown': daily_breakdown,
        'milestones': milestones,
        'recommendedResources': build_recommended_resources(career),
        'estimatedCompletionWeeks': learning_params['totalWeeks'],
        'estimatedCompletionDate': pd.Timestamp.now().isoformat(),
    }


def predict(career, experience, skills, hours_per_day):
    model = load_model()
    input_df = pd.DataFrame([{ 
        'career': career,
        'experience': experience,
        'hoursPerDay': hours_per_day,
        'skills': skills,
    }])

    prediction = model.predict(input_df)[0]
    roadmap = make_structured_roadmap(career, experience, skills, hours_per_day)
    roadmap['predictedCareer'] = prediction
    return roadmap


if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Predict a career roadmap')
    parser.add_argument('--career', required=True)
    parser.add_argument('--experience', required=True)
    parser.add_argument('--skills', required=True)
    parser.add_argument('--hoursPerDay', type=int, required=True)

    args = parser.parse_args()
    roadmap = predict(args.career, args.experience, args.skills, args.hoursPerDay)
    print(roadmap)
