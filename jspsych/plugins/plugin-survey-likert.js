
jsPsych.plugins['survey-likert'] = (function(){
  const plugin = {};
  plugin.info = { name: 'survey-likert' };
  plugin.trial = function(display_element, trial){
    const q=document.createElement('p');
    q.textContent=trial.prompt || '質問';
    display_element.appendChild(q);
    const div=document.createElement('div');
    for(let i=1;i<=5;i++){
      const l=document.createElement('label');
      const r=document.createElement('input');
      r.type='radio';r.name='likert';r.value=i;
      l.appendChild(r);l.appendChild(document.createTextNode(i));
      div.appendChild(l);
    }
    display_element.appendChild(div);
    const btn=document.createElement('button');
    btn.textContent='次へ';
    btn.onclick=()=>{
      const val=document.querySelector('input[name=likert]:checked');
      jsPsych.finishTrial({response:val?val.value:null});
    };
    display_element.appendChild(btn);
  };
  return plugin;
})();
