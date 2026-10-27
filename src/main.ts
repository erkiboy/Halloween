import './styles.css';

const app = document.querySelector<HTMLElement>('#app');

if (!app) {
  throw new Error('Missing #app mount element');
}

app.innerHTML = `
  <section class="screen" aria-labelledby="mission-title">
    <p class="eyebrow">Paranormale Aktivität erkannt</p>
    <h1 id="mission-title">ICS Mansion is haunted</h1>
    <p>Fange fünf Geister und sichere dir deinen Treat.</p>
    <button class="primary-action" type="button">Geisterjagd starten</button>
  </section>
`;
