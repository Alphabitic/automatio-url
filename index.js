import nodemailer from 'nodemailer';
import cron from'node-cron';
import express from 'express'
import cors from 'cors';
import axios from 'axios';
import https from 'https';
import cheerio  from 'cheerio';
import moment from 'moment/moment.js';
import dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const corsOptions = {
  origin: '*',
  methods: 'GET, POST, PUT, DELETE, OPTIONS',
  allowedHeaders: 'Origin, Content-Type, Accept, Authorization, X-Requested-With',
};

app.use(cors(corsOptions));

const checkUrl = async (url) => {
  const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/; // Expression régulière pour valider la syntaxe du lien
  if (!urlRegex.test(url)) {
    return {
      link: url,
      status: 'invalid'
    };
  }

  try {
    const response = await axios.head(url, {
      maxRedirects: 0, // Empêcher les redirections automatiques
      validateStatus: function (status) {
        return status >= 200 && status < 400; // Vérifier que le statut est un succès ou une redirection
      },     httpsAgent:  new https.Agent({ rejectUnauthorized: false }),
      headers: {
        'Access-Control-Allow-Origin': '*', // Ajouter l'en-tête CORS si nécessaire
      },
    });

    // Check if URL was successfully checked
    if (response.status !== 200) {
      return {
        link: url,
        status: 'failure'
      };
    }

    return {
      link: url,
      status: 'success'
    };
  } catch (error) {
    console.error('Error checking url:', error);
    return {
      link: url,
      status: 'error'
    };
  }

};


// Définir la tâche planifiée pour s'exécuter tous les jours à 5h30
app.get('/sendEmailUrl', (req, res) => {
const sendEmail = async (htmlContent) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
      user: "cert.helpdesk@outlook.com",
      pass: process.env.PASSCODE,
    }
  });

const recipients = [ 'Support_Mada@neocles.com','lydia.tahinjanahary@orange.com','dimbyfaneva.randriamarovahoaka@orange.com','hedy.andriamahenina@orange.com'  ];
//const recipients = ['zola_andria@outlook.fr'  ];
  const ccRecipients = ['zolalaina.andrianantenaina@orange.com'  ];
  const bccRecipients = ['cert.helpdesk@outlook.com'];
    const mailOptions = {
      from: 'cert.helpdesk@outlook.com',
      to: recipients.join(','),
      cc: ccRecipients.join(','),
      bcc: bccRecipients.join(','),
    subject: `Vérification des URLs + MxToolbox ce  ${moment().format('DD/MM/YYYY')}`,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
cron.schedule('46 7 * * *', () => {
const checkLinksAndSendEmail = async () => {
  const urls = [
      
    {
      "link": "https://webmail.buyin.pro/lm_auth_proxy?DoLMLogin?curl=L2fowa&curlid=3446992831-3598899218",
      "id": 1,
  },
    {
        "link": "https://webmail.adapei65.fr",
        "id": 6,
    },
    {
        "link": "https://webmail.francebrevets.com",
        "id": 7,
    },
    {
        "link": "https://sts.lixir.fr",
        "id": 8,
    },
    {
        "link": "https://mail.nidek.fr/owa",
        "id": 9,
    },
    {
        "link": "https://webmail.bredinprat.com/lm_auth_proxy?DoLMLogin?curl=L2fowa&curlid=1831998750-2022892364&curlmode=0",
        "id": 10,
    },
    {
        "link": "https://www.lycra.com/en/coolmax-business",
        "id": 11,
    },
    {
        "link": "https://www.fo-rothschild.fr",
        "id": 12,
    },
    {
        "link": "https://francemutuelle.neocles.com",
        "id": 13,
    },
    {
        "link": "https://adapei65.neocles.com",
        "id": 14,
    },
    {
        "link": "https://gieccifinance.neocles.com",
        "id": 15,
    },
    {
        "link": "https://eri.neocles.com/vpn/index_2auth.html",
        "id": 17,
    },
    {
        "link": "https://proudreed.neocles.com/vpn/index.html",
        "id": 18,
    },
    {
        "link": "https://procie.neocles.com/vpn/index.html",
        "id": 19,
    },
    {
        "link": "https://sfcdc65.neocles.com",
        "id": 20,
    },
    {
        "link": "https://sagess-ctx.neocles.com",
        "id": 21,
    },
    {
        "link": "https://envoludia.neocles.com",
        "id": 16,
    },

    {
        "link": "https://mail.francemutuelle.fr/lm_auth_proxy?DoLMLogin?curl=L2fowa&curlid=1799196252-2774585649",
        "id": 22,
    },
];
  
  const results = await Promise.all(urls.map(url => checkUrl(url.link)));
  console.log('Results:', results);

  const emailHtml = generateResultsHtml(results);

  await sendEmail(emailHtml);
};

 function generateResultsHtml(results) {
  let html = `Bonjour,<br><br><strong>Ci-dessous le statut des URLs ce ${moment().format('DD/MM/YYYY')}:</strong><br><br><br><table style='border-collapse: collapse; border: 1px solid #ccc; margin: 15px auto;'>`;
  html += "<thead style='background-color: #f2f2f2;'><tr><th style='padding: 10px; text-align: left;'>N°</th><th style='padding: 10px; text-align: left;'>Nom de l'URL</th><th style='padding: 10px; text-align: left;'>Statut</th></tr></thead>";
  html += '<tbody>';
  
  for (let i = 0; i < results.length; i++) {
    let link = results[i].link;
    if (link.includes('lm_auth_proxy?')) {
      link = link.substring(0, link.indexOf('lm_auth_proxy?'));
    }
    html += '<tr>';
    html += '<td style=\'border: 1px solid #ccc; padding: 10px;\'>' + (i + 1) + '</td>';
    html += '<td style=\'border: 1px solid #ccc; padding: 10px;\'><a href="' + link + '">' + link + '</a></td>';

    if (link === 'https://mail.francemutuelle.fr/') {
      // Check if the website uses the POST method
     
      axios.get(link, {
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      })
      .then((response) => {
        const $ = cheerio.load(response.data);
        const forms = $('form[method="POST"]');
        if (forms.length > 0) {
          // If at least one form uses the POST method, set the status to success
          results[i].status = 'success';
          console.log(results[i].status)
        } else {
          // If no form uses the POST method, set the status to failure
          results[i].status = 'failure';
          console.log(results[i].status)

        }   
        html += '</tr>';
      })
      .catch((error) => {
        // If there is an error, set the status to failure
        results[i].status = 'failure';
        html += '</tr>';
        console.log(results[i].status)
      });
     
      console.log(results[i].status)
      {  html += '<td style=\'border: 1px solid #ccc; padding: 10px;\'>' + (results[i].status === 'success' ? '<span style=\'color: green; font-weight: bold;\'>🟢</span>' : '<span style=\'color: green; font-weight: bold;\'>🟢</span>') + '</td>';}

    
    } else if (link === 'https://envoludia.neocles.com') {
      html += '<td style=\'border: 1px solid #ccc; padding: 10px;\'><span style=\'color: orange; font-weight: bold;\'>⚠️</span> Cliquez sur le lien si vous êtes sur Nomade.</td>';
    } else {
      html += '<td style=\'border: 1px solid #ccc; padding: 10px;\'><span style=\'color: green; font-weight: bold;\'>🟢</span></td>';
    }
    
    html += '</tr>';
      html += '</tr>';
    }
    html += '</tbody>';
    html += `</table>`;
    html += ` <br><strong>Checker l'état du relais de messagerie 85.233.205.2 via le lien ci-dessous:</strong> <br> <br><div>
    <div style="padding: 10px; border: none; border-radius: 5px; width: auto; display: inline-block; margin: 10px auto;">
        <a href="https://mxtoolbox.com/SuperTool.aspx?action=blacklist%3a85.233.205.2&run=toolpage" target="_blank" style="color: blue; text-decoration: none; font-weight: bold; font-size: 16px; font-family: Arial, sans-serif;">
            MXToolBox
        </a>
    </div>
    `;


html += `<div style="margin-top: 30px;">`;

  html +=  `<div style="color: blue; font-weight: bold;margin-top: 30px;">Support Flexible Workspace Services</div>
    <div style="color: orange;">Orange Cloud for Business</div>
    <div style="color: blue;">helpdesk@neocles.com</div>
    <div>Orange Business Services SA                                    </div>
    <div style="color: blue;">Immeuble Terra Nova II – 15 rue Henri Rol-Tanguy 93558 Montreuil</div>
    <div style="color: orange;">
      <a href="https://www.orange-business.com/fr/solutions/cloud-computing" style="color: orange; text-decoration: none;">https://www.orange-business.com/fr/solutions/cloud-computing</a>
    </div>
  </div>`;
    return html;
  }
  
        checkLinksAndSendEmail();
  
    }
  );
})
  app.listen(PORT, () => {
    console.log(`Le serveur est démarré sur le port ${PORT}`)
  })