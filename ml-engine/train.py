import os
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, FunctionTransformer
from joblib import dump
from text_preprocessor import flatten_text_column


def build_dummy_dataset(path):
    careers = [
        'Frontend Developer',
        'Backend Developer',
        'Full Stack Developer',
        'Data Scientist',
        'AI Engineer',
        'Machine Learning Engineer',
        'Cybersecurity Analyst',
        'DevOps Engineer',
        'Cloud Engineer',
        'UI/UX Designer',
        'Android Developer',
        'iOS Developer',
    ]

    levels = ['Beginner', 'Intermediate', 'Advanced']
    skills = [
        'HTML', 'CSS', 'JavaScript', 'React', 'Vue', 'Angular',
        'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Docker',
        'Kubernetes', 'Python', 'Pandas', 'NumPy', 'Scikit-Learn',
        'TensorFlow', 'PyTorch', 'AWS', 'Azure', 'GCP', 'Linux',
        'Git', 'Figma', 'Sketch', 'Swift', 'Kotlin', 'Security',
        'CI/CD', 'Microservices', 'APIs', 'SQL', 'NoSQL'
    ]

    records = []
    for career in careers:
        for level in levels:
            for hours in [1, 2, 3, 4, 5]:
                for base_skill in skills[:10]:
                    input_skills = ','.join(np.random.choice(skills, size=3, replace=False))
                    records.append({
                        'career': career,
                        'experience': level,
                        'hoursPerDay': hours,
                        'skills': input_skills,
                        'target': career,
                    })

    df = pd.DataFrame(records)
    df.to_csv(path, index=False)
    return df


def train():
    csv_path = 'dataset/roadmaps.csv'
    try:
        df = pd.read_csv(csv_path)
    except FileNotFoundError:
        print(f'No dataset found at {csv_path}. Generating dummy dataset...')
        df = build_dummy_dataset(csv_path)

    df['experience'] = df['experience'].astype(str)
    df['career'] = df['career'].astype(str)
    df['skills'] = df['skills'].astype(str)

    X = df[['career', 'experience', 'hoursPerDay', 'skills']]
    y = df['career']

    categorical_features = ['career', 'experience']
    numeric_features = ['hoursPerDay']
    text_features = ['skills']

    categorical_transformer = OneHotEncoder(handle_unknown='ignore', sparse_output=False)
    text_transformer = Pipeline([
        ('flatten', FunctionTransformer(flatten_text_column, validate=False)),
        ('vect', CountVectorizer(token_pattern=r"[^,\s]+")),
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', categorical_transformer, categorical_features),
            ('num', 'passthrough', numeric_features),
            ('txt', text_transformer, text_features),
        ],
        remainder='drop',
        sparse_threshold=0,
    )

    model = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=30, random_state=42)),
    ])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model.fit(X_train, y_train)

    score = model.score(X_test, y_test)
    print(f'Training complete. Validation accuracy: {score:.4f}')

    dump(model, 'models/roadmap_model.joblib')
    print('Saved model to models/roadmap_model.joblib')


if __name__ == '__main__':
    train()
