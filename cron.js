const cron = require('node-cron');

// Définir la tâche de planification qui s'exécutera toutes les minutes
cron.schedule('*/5 * * * *', () => {
  console.log('Cette tâche s\'exécutera toutes les minutes !');
});
