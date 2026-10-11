(() => {
  'use strict';
  const ADDRESS = 'civicascentai@gmail.com';
  const MAX = 1600;
  const clean = (value, limit = 240) => String(value ?? '').replace(/[\r\n\t]/g,' ').trim().slice(0,limit);
  const build = (form) => {
    const data = new FormData(form);
    const type = form.dataset.kind === 'question' ? 'question' : 'interest';
    const email = clean(data.get('reply_email'), 150);
    const name = clean(data.get('first_name'), 80);
    const topic = clean(data.get('topic'), 80);
    const message = clean(data.get('message'), 460);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Error('Enter a valid reply email.');
    if (!topic) throw Error('Please choose a topic.');
    if (type === 'question' && !message) throw Error('Please enter a question.');
    const subject = type === 'interest' ? 'CivicAscent AI | Learner Interest' : 'CivicAscent AI | Question';
    const lines = [
      'CivicAscent AI website contact request',
      'Type: ' + (type === 'interest' ? 'Learning interest' : 'Question'),
      'First name (optional): ' + (name || 'Not provided'),
      'Reply email: ' + email,
      'Topic: ' + topic,
      '',
      type === 'interest' ? 'What I want to learn: ' + (message || 'Please contact me with information.') : 'My question: ' + message,
      '',
      'I am asking CivicAscent AI to respond to this inquiry. This is not paid enrollment, a confirmed workshop seat, or a marketing-list subscription.',
      'Please do not include private financial, medical, identity or military records.'
    ];
    const body = lines.join('\n').slice(0,MAX);
    return {text:'To: ' + ADDRESS + '\nSubject: ' + subject + '\n\n' + body,
      url:'mailto:' + ADDRESS + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body)};
  };
  document.querySelectorAll('form[data-civic-form]').forEach((form) => {
    const status = document.getElementById(form.dataset.status);
    function prepare() { if (!form.reportValidity()) return null; try { return build(form); } catch(e) { if(status) status.textContent = e.message; return null; } }
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const draft=prepare(); if(!draft) return;
      if(status) status.textContent='Your email app should open. Review the message and press Send to contact CivicAscent AI. Nothing has been submitted by this page.';
      window.location.assign(draft.url);
    });
    const copy=form.querySelector('[data-copy-draft]');
    if(copy) copy.addEventListener('click', async () => {
      const draft=prepare(); if(!draft) return;
      try {
        if (!navigator.clipboard?.writeText) throw Error('Clipboard unavailable');
        await navigator.clipboard.writeText(draft.text);
        if(status) status.textContent='Message copied. Open your email app, paste it into a new message, and press Send. Nothing has been submitted yet.';
      } catch {
        if(status) status.textContent='Clipboard unavailable. Use the email button or send a message directly to ' + ADDRESS + '.';
      }
    });
  });
})();
