
jsPsych.plugins['html-button-response'] = (function(){
  const plugin = {};
  plugin.info = { name: 'html-button-response' };
  plugin.trial = function(display_element, trial){
    display_element.innerHTML = '<p>' + trial.stimulus + '</p>';
    trial.choices.forEach((c,i)=>{
      const b=document.createElement('button');
      b.textContent=c;
      b.onclick=()=>jsPsych.finishTrial({button_pressed:i});
      display_element.appendChild(b);
    });
  };
  return plugin;
})();
