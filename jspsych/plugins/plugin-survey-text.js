
jsPsych.plugins['survey-text'] = (function(){
  const plugin = {};
  plugin.info = { name: 'survey-text' };
  plugin.trial = function(display_element, trial){
    const textarea=document.createElement('textarea');
    display_element.appendChild(textarea);
    const btn=document.createElement('button');
    btn.textContent='完了';
    btn.onclick=()=>jsPsych.finishTrial({response:textarea.value});
    display_element.appendChild(btn);
  };
  return plugin;
})();
