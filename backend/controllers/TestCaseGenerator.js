

export const generateTestCases=(req, res) => {

    const { featureDescription } = req.body;

    console.log('Received feature description:', featureDescription);

    res.json({ message: 'Test cases generated successfully!', featureDescription });
};