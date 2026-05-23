import User from "../models/User.js";

export const updateUserSetup = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      selectedPath,
      qualification,
      branch,
      year,
      careerInterest,
      skillLevel,
      duration
    } = req.body;

    // 🔍 Validation
    if (!selectedPath || !careerInterest) {
      return res.status(400).json({
        message: "Path and career interest are required"
      });
    }

    // 🔄 Update user with FULL onboarding data
    const user = await User.findByIdAndUpdate(
      userId,
      {
        selectedPath,
        qualification,
        branch,
        year,
        careerInterest,
        skillLevel: skillLevel || "beginner",
        duration: duration || "3months",
        currentDay: 1
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔐 Remove password
    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      user: userObj
    });

  } catch (error) {
    console.error("SETUP ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};