const express = require('express');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const RENDER_API_KEY = process.env.RENDER_API_KEY;

// הגשת קבצים סטטיים מתוך public/
app.use(express.static('public'));

app.get('/apps', async (req, res) => {
  try {

    const response = await axios.get('https://api.render.com/v1/services', {
      headers: { Authorization: `Bearer ${RENDER_API_KEY}` }
    });
    const apps = response.data;

    // בונים טבלה ב-HTML
    let rows = `
      <table>
        <tr>
          <th>Name</th>
          <th>ID</th>
          <th>Environment</th>
          <th>Status</th>
        </tr>
    `;

    apps.forEach(a => {
      rows += `
        <tr>
          <td>${a.service.name}</td>
          <td><a href="${a.service.dashboardUrl}" target="_blank">${a.service.id}</a></td>
          <td>${a.service.serviceDetails.env}</td>
          <td>${a.service.suspended}</td>
        </tr>
      `;
    });

    rows += `</table>`;

    // טוענים את קובץ ה-HTML ומכניסים את הטבלה
    const html = fs.readFileSync('./public/apps.html', 'utf8').replace('{{TABLE}}', rows);

    res.set('Content-Type', 'text/html');
    res.send(html);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
app.get('/', (req, res) => {
  res.redirect('/apps');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
