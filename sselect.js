function select_suggest(field_id) {
76 /*
    * field_id - id of the select field
    *
86  */
87
88 var wrap_div = $('<div style="position: relative; display: inline; padding:0; margin: 0"></div>');
89 var img = $('<img src="/media/images/icon_wand.gif" style="cursor: pointer;" title="Toggle suggest"/>');
90 var input_string = $('<input type="string" style="width:250px" name="task_type" class="hidden" autocomplete="off"/>');
91
92 var ul_c = $('<ul><i></i></ul>');
93 var close_btn = $('<span style="float: right; cursor: pointer;">✘</span>');
94 var choices_div = $('<div class="task-type-suggest hidden"></div>');
95
96 var field = $('#' + field_id);
97
98 // construct required DOM
99 choices_div.append(close_btn);
100 choices_div.append(ul_c);
101 field.wrap(wrap_div);
102 field.before(img);
103 field.after(input_string);
104 field.after(choices_div);
105 // end
106
107 // initialization
108 var field_suggest = input_string;
109 var pressed = false;
110 var all_choices;
111 var all_values;
112 if (field.find('optgroup').length) {
113 all_choices = $('#' + field_id + ' optgroup option').map(function() {return $(this).text();});
114 all_values = $('#' + field_id + ' optgroup option').map(function() {return $(this).val();});
115 } else {
116 all_choices = $('#' + field_id + ' option').not(':first').map(function() {return $(this).text();});
117 all_values = $('#' + field_id + ' option').not(':first').map(function() {return $(this).val();});
118 }
119 var ul = ul_c;
120 var suggest_toggle = img;
121 var current_li = null;
122 var choices = [];
123
124 var specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g"); // .*+?|()[]{}\
125
126
127
128 function hide_suggest() {
129 pressed = false;
130 current_li = null;
131 field.toggleClass('hidden');
132 field_suggest.toggleClass('hidden');
133 choices_div.toggleClass('hidden');
134 field.focus();
135 field_suggest.val('');
136 ul.find('li').remove();
137 }
138
139 close_btn.click(function(){hide_suggest();});
140
141 suggest_toggle.click(function(event) {
142 if (pressed) {
143 hide_suggest();
144 return;
145 }
146
147 var v = '';
148 pressed = true;
149 field.toggleClass('hidden');
150 field_suggest.toggleClass('hidden');
151 field_suggest.focus()
152 field_suggest.val(v);
153 v = v.replace(specials, "\\$&");
154 var re = new RegExp(v, "i");
155 choices = [];
156 current_li = null;
157
158 ul.find('li').remove();
159
160 for(var i = 0; i < all_choices.length; i++) {
161 var index = all_choices[i].search(re);
162 if (index == -1) { continue; }
163 choices.push([all_choices[i], i, v.length, all_values[i]]);
164 if (choices.length <= 20) {
165 ul.append('<li title="' + all_values[i] + '">' + all_choices[i].substr(0,index)
166 + '<b>' + all_choices[i].substr(index, v.length) + '</b>'
167 + all_choices[i].substr(index + v.length, all_choices[i].length) + '</li>')
168 }
169 }
170 ul.find('i').text('Showing '+ ul.find('li').length + ' of ' + choices.length)
171 choices_div.height(choices.lenght * 10);
172 choices_div.toggleClass('hidden');
173 ul.undelegate('li', 'click');
174 ul.delegate('li', 'click', function(event){
175 event.preventDefault();
176 field.val($(this).attr('title'));
177 field.change();
178 hide_suggest();
179 });
180 });
181
182 ul.focusout(function(event) {
183 if (!pressed) { return; }
184 hide_suggest();
185 });
186
187 var ev = $.browser.opera ? 'keypress' : 'keydown';
188
189 field_suggest.bind(ev, function(event) {
190 var code = (event.keyCode ? event.keyCode : event.which);
191
192 if (code == 13) {
193 if (current_li != null) {
194 field.val(choices[current_li][3]);
195 field.change();
196 }
197 hide_suggest();
198 event.preventDefault();
199 } else if ((code == 8 || code == 46) && $(this).val().length == 0) {
200 event.preventDefault();
201 hide_suggest();
202 } else if ((code == 38 || code == 40) && choices.length > 0) {
203 if (current_li == null) {
204 if (code == 38) { return; }
205 current_li = 0;
206 $('li[title=' + choices[current_li][3] + ']').css('background-color', '#ccc');
207 } else {
208 if (code == 40 && (current_li >= (choices.length-1) || current_li >= 19)) { return; }
209 if (code == 38 && current_li == 0) { return; }
210
211 if (code == 38) {
212 $('li[title=' + choices[current_li][3] + ']').css('background-color', '');
213 current_li--;
214 } else {
215 $('li[title=' + choices[current_li][3] + ']').css('background-color', '');
216 current_li++;
217 }
218 $('li[title=' + choices[current_li][3] + ']').css('background-color', '#ccc');
219 }
220 }
221 });
222
223 field_suggest.keyup(function(event) {
224 var code = (event.keyCode ? event.keyCode : event.which);
225
226 if (code == 13) {
227 event.preventDefault();
228 hide_suggest();
229 } else if ((code == 8 || code == 46) && $(this).val().length == 0) {
230 event.preventDefault();
231 hide_suggest();
232 } else if (String.fromCharCode(code).match(/[\s\w]/) || code == 8 || code == 46) {
233 var v;
234 v = $(this).val();
235
236 v = v.replace(specials, "\\$&");
237 var re = new RegExp(v, "i");
238 choices = [];
239 current_li = null;
240
241 ul.find('li').remove();
242
243 if (v.length == 0) { return; }
244
245 for(var i = 0; i < all_choices.length; i++) {
246 var index = all_choices[i].search(re);
247 if (index == -1) { continue; }
248 choices.push([all_choices[i], i, v.length, all_values[i]]);
249 if (choices.length <= 20) {
250 ul.append('<li title="' + all_values[i] + '">' + all_choices[i].substr(0,index)
251 + '<b>' + all_choices[i].substr(index, v.length) + '</b>'
252 + all_choices[i].substr(index + v.length, all_choices[i].length) + '</li>')
253 }
254 }
255 ul.find('i').text('Showing '+ ul.find('li').length + ' of ' + choices.length)
256 choices_div.height(choices.lenght * 10);
257 ul.undelegate('li', 'click');
258 ul.delegate('li', 'click', function(event){
259 event.preventDefault();
260 field.val($(this).attr('title'));
261 field.change();
262 hide_suggest();
263 });
264 }
265 });
266}; 
