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
   
