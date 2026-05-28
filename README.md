超级无敌螺旋智慧笔记
作用： 
1，便签功能，日常记录笔记事务的小便签 
2，笔记功能，介于我日常学习网课过程中手写笔记麻烦，平板不方便，故而开发这一款小笔记，用来记录学习等事务 
3，亮点1，接入deepseek大模型，用户可以在写笔记的同时进行AI整理，含知识点，智能分段，思维导图三大功能，用户可以在复制到笔记，或者进行预览然后选择是否放入笔记中。
4，亮点2，接入豆包大模型，采用抽帧加读取音频的方式来分析视频进行视频分析总结成笔记，例如上传旅游视频可以形成旅游攻略笔记，做饭生活类视频生成做饭笔记，学习视频生成学习笔记。
想法来源，我是一名在校大一新生，由于想学习一下新的技术什么的就要去看网课，我就发现手写笔记很累，要是有个笔记应用，我把网课发过去，直接帮我总结多好，
而且这个甚至可以分析整个网课，不会跟手机AI一样分析完了就没有保存，然后就开发了这个一个笔记应用，不只是学习，生活也可以用了.
 
 要自己配置一下APIKEY哦
 learn-notes/.env：                                                                                                                                                               
  VITE_ARK_API_KEY=粘贴你的火山引擎ARK Key                                                                                                                                         
  VITE_DEEPSEEK_API_KEY=粘贴你的DeepSeek Key                                                                                                                                       
                                                                                                                                                                                   
  learn-notes-api/.env：                                                                                                                                                           
  ARK_API_KEY=粘贴你的火山引擎ARK Key                                                                                                                                              
  DEEPSEEK_API_KEY=粘贴你的DeepSeek Key                                                                                                                                            
  ASR_API_KEY=粘贴你的火山引擎ASR Key                                                                                                                                              
                                                                                                                                                                                   
  三个 Key 的获取地址：                                                                                                                                                            
  - ARK（视频分析）：console.volcengine.com/ark → API Key 管理                                                                                                                     
  - DeepSeek（AI 整理）：platform.deepseek.com → API Keys                                                                                                                          
  - ASR（语音识别）：console.volcengine.com/speech → 语音技术  
