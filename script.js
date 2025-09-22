const stageData = [
  {
    id: 0,
    title: 'Stage 0: Welcome to Clarity',
    summary:
      'Your journey begins once you’ve accepted your quote. This officially kicks off the installation process.',
    bullets: [],
    duration: 0,
    isMilestone: true,
  },
  {
    id: 1,
    title: 'Stage 1: Getting Started',
    summary: 'We organize your project team and activate the workflow that keeps everything on track.',
    bullets: [
      'Order Assignment – Your accepted order is assigned to a Provisioning Specialist.',
      'Welcome Email – You’ll receive a confirmation email with an outline of the next steps.',
      'Workflow Setup – We create an internal workflow to track your project from start to finish.',
    ],
    duration: 3,
  },
  {
    id: 2,
    title: 'Stage 2: Kickoff Call',
    summary: 'Align on goals, review your network, and set a target installation date with your Project Installer.',
    bullets: [
      'Installer Introduction – A Project Installer will schedule your kickoff call.',
      'Target Date & Network Discovery – Together, we’ll discuss your goals and select a target installation date.',
      'Configuration Discussion – We’ll talk through how your account should be set up to best serve your business needs.',
    ],
    duration: 4,
  },
  {
    id: 3,
    title: 'Stage 3: Planning Your Setup',
    summary: 'We configure your account, confirm the virtual install date, and order equipment or new numbers.',
    bullets: [
      'Account Configuration – Setting up routing, extensions, SMS, and more.',
      'Virtual Install Scheduling – We’ll work with you to confirm your virtual installation date.',
      'Equipment & Numbers – Ordering your phones, equipment, and any new phone numbers needed.',
    ],
    duration: 6,
  },
  {
    id: 4,
    title: 'Stage 4: Getting Online',
    summary: 'Your system is installed virtually and your team is trained on the Clarity Voice Portal.',
    bullets: ['Virtual Installation & Training – Your system will be installed virtually and we’ll provide training on the portal.'],
    duration: 3,
  },
  {
    id: 5,
    title: 'Stage 5: Number Porting',
    summary: 'We coordinate with your current provider to port numbers, test routing, and activate service.',
    bullets: [
      'Port Request – We submit the order to move your phone numbers from your current provider to Clarity.',
      'Testing & Activation – On port day, we test your numbers and routing to ensure a smooth transition.',
    ],
    duration: 5,
    note: 'Please allow up to 10 business days after services are online for number porting to be fully completed.',
  },
  {
    id: 6,
    title: 'Stage 6: Welcome Aboard!',
    summary:
      'Congratulations! Your Clarity Voice system is now fully live and you’re connected with our Customer Experience team.',
    bullets: ['Customer Experience Introduction – Meet the team who will support you moving forward.'],
    duration: 0,
    isMilestone: true,
  },
];

const businessDayFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const shortFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});

function subtractBusinessDays(date, days) {
  const result = new Date(date);
  let remaining = days;

  while (remaining > 0) {
    result.setDate(result.getDate() - 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) {
      remaining -= 1;
    }
  }

  return result;
}

function addBusinessDays(date, days) {
  const result = new Date(date);
  let remaining = days;

  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) {
      remaining -= 1;
    }
  }

  return result;
}

function calculateStageWindows(targetDate) {
  const windows = new Map();
  let cursor = new Date(targetDate);

  for (let i = stageData.length - 1; i >= 0; i -= 1) {
    const stage = stageData[i];

    if (stage.duration === 0) {
      windows.set(stage.id, {
        start: new Date(cursor),
        end: new Date(cursor),
      });
      continue;
    }

    const start = subtractBusinessDays(cursor, stage.duration - 1);
    windows.set(stage.id, {
      start,
      end: new Date(cursor),
    });

    cursor = subtractBusinessDays(start, 1);
  }

  // Stage 0 (kickoff) begins when Stage 1 window does.
  const stageOneWindow = windows.get(1);
  if (stageOneWindow) {
    windows.set(0, {
      start: new Date(stageOneWindow.start),
      end: new Date(stageOneWindow.start),
    });
  }

  return windows;
}

function createStageCard(stage, window) {
  const card = document.createElement('article');
  card.className = 'stage-card';
  if (stage.isMilestone) {
    card.classList.add('stage-card--milestone');
  }

  const header = document.createElement('div');
  header.className = 'stage-card__header';

  const index = document.createElement('span');
  index.className = 'stage-card__index';
  index.textContent = stage.id;
  header.appendChild(index);

  const title = document.createElement('h3');
  title.className = 'stage-card__title';
  title.textContent = stage.title;
  header.appendChild(title);

  const windowLabel = document.createElement('span');
  windowLabel.className = 'stage-card__window';

  if (stage.duration === 0) {
    windowLabel.textContent = `Milestone • ${businessDayFormatter.format(window.start)}`;
  } else {
    windowLabel.textContent = `Estimated window: ${businessDayFormatter.format(window.start)} – ${businessDayFormatter.format(
      window.end,
    )}`;
  }

  header.appendChild(windowLabel);

  const description = document.createElement('p');
  description.className = 'stage-card__description';
  description.textContent = stage.summary;

  const list = document.createElement('ul');
  list.className = 'stage-card__list';
  stage.bullets.forEach((bullet) => {
    const li = document.createElement('li');
    li.textContent = bullet;
    list.appendChild(li);
  });

  card.append(header, description);

  if (stage.bullets.length > 0) {
    card.appendChild(list);
  }

  if (stage.note) {
    const note = document.createElement('p');
    note.className = 'stage-card__note';
    note.textContent = stage.note;
    card.appendChild(note);
  }

  return card;
}

function buildTimelineBar() {
  const totalDuration = stageData.reduce((acc, stage) => acc + stage.duration, 0);
  const container = document.getElementById('timeline-bar');
  container.innerHTML = '';

  stageData
    .filter((stage) => stage.duration > 0)
    .forEach((stage) => {
      const segment = document.createElement('div');
      segment.className = 'timeline__bar-segment';

      const label = document.createElement('div');
      label.innerHTML = `<strong>${stage.title.replace('Stage ', '')}</strong><span>${stage.duration} business days</span>`;

      const progress = document.createElement('div');
      progress.className = 'timeline__bar-progress';
      progress.style.setProperty('--progress-width', `${Math.round((stage.duration / totalDuration) * 100)}%`);

      const fill = document.createElement('span');
      progress.appendChild(fill);

      segment.append(label, progress);
      container.appendChild(segment);
    });
}

function renderStages(windows) {
  const stagesContainer = document.getElementById('stages');
  stagesContainer.innerHTML = '';

  stageData.forEach((stage) => {
    const window = windows.get(stage.id);
    const card = createStageCard(stage, window);

    if (!stage.isMilestone && stage.duration > 0) {
      const previousStage = [...stageData]
        .slice(0, stageData.indexOf(stage))
        .reverse()
        .find((entry) => entry.duration > 0);

      if (previousStage) {
        const handoffWindow = windows.get(previousStage.id);
        if (handoffWindow) {
          const kickoffLabel = document.createElement('p');
          kickoffLabel.className = 'stage-card__window';
          kickoffLabel.style.marginTop = '0.75rem';
          kickoffLabel.textContent = `Stay on pace: complete previous tasks by ${shortFormatter.format(handoffWindow.end)}.`;
          card.appendChild(kickoffLabel);
        }
      }
    }

    stagesContainer.appendChild(card);
  });
}

function initialize() {
  const targetInput = document.getElementById('target-date');
  const timelineDays = document.getElementById('timeline-days');
  const today = new Date();
  const defaultTarget = addBusinessDays(today, 21);

  targetInput.valueAsDate = defaultTarget;
  timelineDays.textContent = stageData.reduce((acc, stage) => acc + stage.duration, 0);

  const updateTimeline = () => {
    const selectedDate = targetInput.valueAsDate;
    if (!selectedDate) {
      return;
    }

    const windows = calculateStageWindows(selectedDate);
    renderStages(windows);
  };

  targetInput.addEventListener('change', updateTimeline);

  buildTimelineBar();
  updateTimeline();

  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}

document.addEventListener('DOMContentLoaded', initialize);
