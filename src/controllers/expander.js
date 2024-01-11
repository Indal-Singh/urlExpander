const { exec } = require('child_process');

const splitAndTrim = (inputString) => {
  // Split the string based on commas, spaces, and newline characters
  const wordsArray = inputString.split(/[\s,]+/);

  // Trim and filter valid URLs
  const trimmedArray = wordsArray.map((word) => word.trim()).filter((word) => isVaildUrl(word));

  return trimmedArray;
};

const isVaildUrl = (url) => {
  const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;

  return urlRegex.test(url);
}
const getExpandUrl = async (url) => {
  return new Promise((resolve, reject) => {
    const command = `curl --head "${url}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}`);
        return;
      }

      const headersArray = stdout.split('\n').filter(line => line.trim() !== '');
      const headersObject = headersArray.reduce((acc, line) => {
        const [key, ...values] = line.split(':');
        const lowercaseKey = key.trim().toLowerCase();
        const value = values.join(':').trim();
        acc[lowercaseKey] = value;
        return acc;
      }, {});

      let expURL = (headersObject.location)?headersObject.location:url;
      // Corrected this line to use 'Location' as the key
      resolve(encodeURI(expURL));
    });
  });
}

const handleUrlExpander = async (req, res) => {
  if (!req.body.url) {
    req.flash('error', 'URL is required...');
    res.redirect('/');
    return;
  }

  const shortUrls = splitAndTrim(req.body.url);

  try {
    const expandedURLs = await Promise.all(shortUrls.map((url) => getExpandUrl(url)));
    const result = shortUrls.map((shortUrl, index) => ({
      ogu: shortUrl,
      exu: expandedURLs[index],
    }));

    console.log(result);
    req.flash('urls', result);
    res.redirect('/');
  } catch (error) {
    console.error('Error expanding URL:', error.message);
    res.status(500).json({ error: 'Error expanding URL' });
  }
};

module.exports = handleUrlExpander;
