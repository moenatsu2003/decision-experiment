// Simplified local jsPsych 7.x compatible ESM build
// Generated automatically for offline use
export function initJsPsych(params = {}) {
  const jsPsych = {
    data: {
      _data: [],
      add: (d) => jsPsych.data._data.push(d),
      get: () => jsPsych.data._data,
      displayData: () => {
        const pre = document.createElement('pre');
        pre.textContent = JSON.stringify(jsPsych.data._data, null, 2);
        document.body.innerHTML = '';
        document.body.appendChild(pre);
      }
    },
    timeline: [],
    _on_finish: params.on_finish || (() => {}),
    run(timeline) {
      jsPsych.timeline = timeline;
      jsPsych._runNextTrial();
    },
    _runNextTrial() {
      if (jsPsych.timeline.length === 0) {
        jsPsych._on_finish();
        return;
      }
      const trial = jsPsych.timeline.shift();
      const plugin = trial.type;
      plugin({ ...trial, on_finish: (data) => {
        jsPsych.data.add(data);
        jsPsych._runNextTrial();
      }});
    }
  };
  return jsPsych;
}
