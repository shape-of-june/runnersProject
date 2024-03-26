const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

// Define a route to start crawling
app.get('/crawl', async (req, res) => {
    try {
        const url = req.query.url; // Get URL to crawl from query parameter
        // http://localhost:3000/crawl?url=https://cs.yonsei.ac.kr/bbs/board.php?bo_table=sub5_1
        if (!url) {
            return res.status(400).send('Please provide a URL to crawl.');
        }
        // Make a GET request to the provided URL
        const response = await axios.get(url);

        // Load the HTML content of the page using cheerio
        const $ = cheerio.load(response.data);

        // Extract the links from the page
        const links = [];
        const titles = [];

        $('tr.bo_notice td.td_subject div.bo_tit a').each((index, element) => {
            const link = $(element).attr('href');
            const title = $(element).text().trim();
            if (link) {
                links.push([title,link]);
            }
        });
        const html = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Crawled Links</title>
          </head>
          <body>
              <h1>Crawled Links</h1>
              <ul>
                  ${links.map(link => `<li><a href="${link[1]}">${link[0]}</a></li>`).join('\n')}
              </ul>
          </body>
          </html>
        `;

        // // Send the extracted links as the response
        // res.json(links);
        
        // Set Content-Type header to indicate that the response contains HTML
        res.set('Content-Type', 'text/html');

        // Send the HTML string as the response
        res.send(html);

    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send('An error occurred while crawling the website.');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
