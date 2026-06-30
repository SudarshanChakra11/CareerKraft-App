import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoadmap, getRoadmap } from "@/services/api";
import { getStoredUser } from "@/lib/store";
import "./RoadmapGenerator.css";

const RoadmapGenerator = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('form'); // 'form' | 'generating' | 'display'
  const [formData, setFormData] = useState({
    qualification: '',
    currentYear: '',
    branch: '',
    careerInterest: '',
  });
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [savedRoadmap, setSavedRoadmap] = useState(null);

  const qualifications = ['BE/BTech', 'ME/MTech'];
  const years = [1, 2, 3, 4];
  const branches = [
    'AI & DS',
    'IT',
    'Computer Science',
    'E&TC',
    'Mechanical',
    'Civil',
    'Others',
  ];
  const careerInterests = [
    'Full Stack Development',
    'AI/ML',
    'Data Science',
    'Cybersecurity',
    'Cloud Computing',
    'DevOps',
    'App Development',
    'Others',
  ];

  const user = getStoredUser();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.qualification || !formData.currentYear || !formData.branch || !formData.careerInterest) {
      setError('Please fill in all fields');
      return false;
    }
    return true;
  };

  const loadSavedRoadmap = async () => {
    if (!user) return;

    try {
      const response = await getRoadmap(user._id || user.id);
      if (response.success && response.data) {
        const roadmapData = response.data;
        setRoadmap(roadmapData);
        setSavedRoadmap(roadmapData);
        setSelectedPhase(roadmapData.phases?.[0] || null);
        setFormData({
          qualification: roadmapData.studentProfile?.qualification || '',
          currentYear: roadmapData.studentProfile?.currentYear?.toString() || '',
          branch: roadmapData.studentProfile?.branch || '',
          careerInterest: roadmapData.studentProfile?.careerInterest || '',
        });
        setStep('display');
      } else {
        setStep('form');
      }
    } catch (err) {
      setStep('form');
      if (!err.message.includes('404')) {
        setError(err.message || 'Unable to load your saved roadmap');
      }
    }
  };

  useEffect(() => {
    loadSavedRoadmap();
  }, [user]);

  const handleGenerateRoadmap = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setStep('generating');

    try {
      const response = await createRoadmap(formData);
      if (response.success) {
        setRoadmap(response.data);
        setSavedRoadmap(response.data);
        setSelectedPhase(response.data.phases?.[0] || null);
        setFormData({
          qualification: response.data.studentProfile?.qualification || '',
          currentYear: response.data.studentProfile?.currentYear?.toString() || '',
          branch: response.data.studentProfile?.branch || '',
          careerInterest: response.data.studentProfile?.careerInterest || '',
        });
        setStep('display');
      } else {
        setError(response.message || 'Failed to generate roadmap');
        setStep('form');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
      setStep('form');
    } finally {
      setLoading(false);
    }
  };


  const renderForm = () => (
    <div className="roadmap-form-container">
      <div className="form-header">
        <h1>Create Your Learning Roadmap</h1>
        <p>Tell us about yourself and we'll create a personalized path to success</p>
      </div>

      <form onSubmit={handleGenerateRoadmap} className="roadmap-form">
        {/* Qualification */}
        <div className="form-group">
          <label htmlFor="qualification">Qualification *</label>
          <select
            id="qualification"
            name="qualification"
            value={formData.qualification}
            onChange={handleInputChange}
            required
          >
            <option value="">Select your qualification</option>
            {qualifications.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </div>

        {/* Current Year */}
        <div className="form-group">
          <label htmlFor="currentYear">Current Year *</label>
          <select
            id="currentYear"
            name="currentYear"
            value={formData.currentYear}
            onChange={handleInputChange}
            required
          >
            <option value="">Select your current year</option>
            {years.map((y) => (
              <option key={y} value={y}>
                Year {y}
              </option>
            ))}
          </select>
        </div>

        {/* Branch */}
        <div className="form-group">
          <label htmlFor="branch">Branch / Department *</label>
          <select
            id="branch"
            name="branch"
            value={formData.branch}
            onChange={handleInputChange}
            required
          >
            <option value="">Select your branch</option>
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Career Interest */}
        <div className="form-group">
          <label htmlFor="careerInterest">Career Interest *</label>
          <select
            id="careerInterest"
            name="careerInterest"
            value={formData.careerInterest}
            onChange={handleInputChange}
            required
          >
            <option value="">Select your career interest</option>
            {careerInterests.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Submit Button */}
        <button type="submit" className="btn-generate" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Roadmap'}
        </button>
      </form>
    </div>
  );

  const renderGenerating = () => (
    <div className="roadmap-generating-container">
      <div className="spinner"></div>
      <h2>Creating Your Personalized Roadmap...</h2>
      <p>Our AI is analyzing your profile and designing the perfect learning path.</p>
    </div>
  );


  const renderRoadmapDisplay = () => (
    <div className="roadmap-display-container">
      {/* Header */}
      <div className="roadmap-header">
        <h1>Your Personalized Learning Roadmap</h1>
        {savedRoadmap && (
          <div className="roadmap-saved-badge">
            Saved roadmap loaded from your profile
          </div>
        )}
        <div className="roadmap-meta">
          <span className="meta-item">
            <strong>Career Goal:</strong> {roadmap?.studentProfile?.careerInterest}
          </span>
          <span className="meta-item">
            <strong>Years Remaining:</strong> {roadmap?.learningParams?.totalMonthsRemaining} months
          </span>
          <span className="meta-item">
            <strong>Pace:</strong> {roadmap?.learningParams?.learningPace}
          </span>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="progress-overview">
        <div className="progress-stat">
          <span className="stat-value">{roadmap?.progress?.completionPercentage || 0}%</span>
          <span className="stat-label">Complete</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${roadmap?.progress?.completionPercentage || 0}%` }}
          ></div>
        </div>
      </div>

      {/* Phases Overview */}
      <div className="phases-section">
        <h2>Learning Phases</h2>
        <div className="phases-grid">
          {roadmap?.phases?.map((phase, index) => (
            <div
              key={index}
              className={`phase-card ${selectedPhase?.phaseNumber === phase.phaseNumber ? 'active' : ''}`}
              onClick={() => setSelectedPhase(phase)}
            >
              <div className="phase-number">Phase {phase.phaseNumber}</div>
              <div className="phase-title">{phase.title}</div>
              <div className="phase-duration">{phase.duration}</div>
              <div className="phase-focus">{phase.focus}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Phase Details */}
      {selectedPhase && (
        <div className="phase-details">
          <h2>{selectedPhase.title}</h2>

          {/* Objectives */}
          <div className="detail-section">
            <h3>Learning Objectives</h3>
            <ul className="objectives-list">
              {selectedPhase.objectives?.map((obj, idx) => (
                <li key={idx}>{obj}</li>
              ))}
            </ul>
          </div>

          {/* Topics */}
          <div className="detail-section">
            <h3>Topics to Cover</h3>
            <div className="topics-list">
              {selectedPhase.topics?.map((topic, idx) => (
                <div key={idx} className="topic-item">
                  <h4>{topic.name}</h4>
                  <p className="duration">{topic.duration}</p>
                  {topic.subtopics?.length > 0 && (
                    <div className="subtopics">
                      <strong>Subtopics:</strong>
                      <ul>
                        {topic.subtopics.map((sub, i) => (
                          <li key={i}>{sub}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          {selectedPhase.projects?.length > 0 && (
            <div className="detail-section">
              <h3>Projects</h3>
              <ul className="projects-list">
                {selectedPhase.projects.map((project, idx) => (
                  <li key={idx}>{project}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills */}
          {selectedPhase.skills?.length > 0 && (
            <div className="detail-section">
              <h3>Skills to Develop</h3>
              <div className="skills-tags">
                {selectedPhase.skills.map((skill, idx) => (
                  <span key={idx} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Daily Tasks */}
      <div className="daily-tasks-section">
        <h2>Daily Tasks</h2>
        <div className="daily-tasks-slider">
          {roadmap?.dailyBreakdown?.slice(0, 5).map((day) => (
            <div
              key={day.day}
              className={`daily-task-card ${currentDay === day.day ? 'active' : ''}`}
              onClick={() => setCurrentDay(day.day)}
            >
              <div className="day-number">Day {day.day}</div>
              <div className="day-topic">{day.topic}</div>
              <div className="day-tasks">{day.tasks?.length} tasks</div>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      {roadmap?.milestones?.length > 0 && (
        <div className="milestones-section">
          <h2>Key Milestones</h2>
          <div className="milestones-timeline">
            {roadmap.milestones.map((milestone, idx) => (
              <div key={idx} className="milestone-item">
                <div className="milestone-month">Month {milestone.month}</div>
                <div className="milestone-name">{milestone.milestone}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Resources */}
      {roadmap?.recommendedResources && (
        <div className="resources-section">
          <h2>Recommended Resources</h2>
          <div className="resources-grid">
            {roadmap.recommendedResources.books?.length > 0 && (
              <div className="resource-category">
                <h3>📚 Books</h3>
                <ul>
                  {roadmap.recommendedResources.books.map((book, idx) => (
                    <li key={idx}>{book}</li>
                  ))}
                </ul>
              </div>
            )}
            {roadmap.recommendedResources.courses?.length > 0 && (
              <div className="resource-category">
                <h3>🎓 Courses</h3>
                <ul>
                  {roadmap.recommendedResources.courses.map((course, idx) => (
                    <li key={idx}>{course}</li>
                  ))}
                </ul>
              </div>
            )}
            {roadmap.recommendedResources.tools?.length > 0 && (
              <div className="resource-category">
                <h3>🛠️ Tools</h3>
                <ul>
                  {roadmap.recommendedResources.tools.map((tool, idx) => (
                    <li key={idx}>{tool}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="btn-start" onClick={() => navigate('/day/1')}>
          Start Roadmap
        </button>
        <button
          className="btn-download"
          onClick={() => alert('Downloading PDF...')}
        >
          Download as PDF
        </button>
        <button className="btn-regenerate" onClick={() => setStep('form')}>
          Regenerate Roadmap
        </button>
      </div>
    </div>
  );

  return (
    <div className="roadmap-generator">
      {step === 'form' && renderForm()}
      {step === 'generating' && renderGenerating()}
      {step === 'display' && renderRoadmapDisplay()}
    </div>
  );
};

export default RoadmapGenerator;