// controllers/authController.js

exports.getUserDetails = (req, res) => {
    // Assuming req.user is set by the authenticateToken middleware
    const user = req.user;
  
    // Fetch user details from the database if necessary
    // For demonstration, returning mock data
    res.status(200).json({
      email: user.email,
      websitePreferences: {
        theme: 'Dark',
        layout: 'Single Column',
        colorScheme: 'Blue',
      },
      description: 'A passionate developer building awesome websites!',
    });
  };
   
// Controller to update website preferences
exports.updateWebsitePreferences = async (req, res) => {
  const { theme, layout, colorScheme } = req.body;

  // Validate input
  if (!theme || !layout || !colorScheme) {
    return res.status(400).json({ message: 'All preference fields are required' });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        websitePreferences: { theme, layout, colorScheme },
      },
      { new: true }
    ).select('-password'); // Exclude password from the response

    res.status(200).json({ websitePreferences: updatedUser.websitePreferences });
  } catch (error) {
    console.error('Error updating preferences:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Controller to update user description
exports.updateUserDescription = async (req, res) => {
  const { description } = req.body;

  // Validate input
  if (!description) {
    return res.status(400).json({ message: 'Description is required' });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        description,
      },
      { new: true }
    ).select('-password'); // Exclude password from the response

    res.status(200).json({ description: updatedUser.description });
  } catch (error) {
    console.error('Error updating description:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};