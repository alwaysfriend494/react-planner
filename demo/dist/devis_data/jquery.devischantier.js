// Simple list
let units = JSON.parse('["Douzaines", "Forfait", "Heures", "Jours", "Km", "L", "Mois", "Mois (jours ouvr\\u00e9s)", "Rlx", "Semaine", "U", "Unit\\u00e9(s) / Forfait(s)", "cm", "dans", "fl oz (US)", "g", "gallon (US)", "kg", "km", "livre", "m", "mL", "mi", "m\\u00b2", "m\\u00b2 / Ms", "m\\u00b3", "once", "pied", "pied\\u00b3", "pouces\\u00b3", "quart (US)", "t"]');

function toValidNumber(num) {
	if (typeof num != 'string') {
		return num;
	}
	num = num.replace(',', '.');
	num = num.replace(' ', '');
	num = num.replace(/[^\d.-]/g, '');
	return num;
}

function textAreaAdjust(element) {
  element.style.height = "1px";
  element.style.height = (1+element.scrollHeight)+"px";
}

function toFixed(num, n) {
	return toFixedFrench(num, n);
	if (typeof num === 'undefined') {
		return '---';
	}
	return num.toFixed(n);
}

function toFixedFrench(num, n) {
	if (isNaN(num)) {
		return '0';
	}
	if (typeof num === 'undefined') {
		return '---';
	}
	i = Math.floor(num+0.0001);
	f = num - i;
	return i.toLocaleString('fr') + ',' + f.toFixed(n).replace('-', '').substr(2);
}

function uniqueID() {
	return Date.now() + '' + Math.floor(Math.random() * 100000000)
}



// https://stackoverflow.com/a/63105543
let parens = /\(([0-9+\-*/\^ .]+)\)/             // Regex for identifying parenthetical expressions
let exp = /(\d+(?:\.\d+)?) ?\^ ?(\d+(?:\.\d+)?)/ // Regex for identifying exponentials (x ^ y)
let mul = /(\d+(?:\.\d+)?) ?\* ?(\d+(?:\.\d+)?)/ // Regex for identifying multiplication (x * y)
let div = /(\d+(?:\.\d+)?) ?\/ ?(\d+(?:\.\d+)?)/ // Regex for identifying division (x / y)
let add = /(\d+(?:\.\d+)?) ?\+ ?(\d+(?:\.\d+)?)/ // Regex for identifying addition (x + y)
let sub = /(\d+(?:\.\d+)?) ?- ?(\d+(?:\.\d+)?)/  // Regex for identifying subtraction (x - y)

/**
 * Evaluates a numerical expression as a string and returns a Number
 * Follows standard PEMDAS operation ordering
 * @param {String} expr Numerical expression input
 * @returns {Number} Result of expression
 */
function evaluate(expr)
{
    if(isNaN(Number(expr)))
    {
        if(parens.test(expr))
        {
            let newExpr = expr.replace(parens, function(match, subExpr) {
                return evaluate(subExpr);
            });
            return evaluate(newExpr);
        }
        else if(exp.test(expr))
        {
            let newExpr = expr.replace(exp, function(match, base, pow) {
                return Math.pow(Number(base), Number(pow));
            });
            return evaluate(newExpr);
        }
        else if(mul.test(expr))
        {
            let newExpr = expr.replace(mul, function(match, a, b) {
                return Number(a) * Number(b);
            });
            return evaluate(newExpr);
        }
        else if(div.test(expr))
        {
            let newExpr = expr.replace(div, function(match, a, b) {
                if(b != 0)
                    return Number(a) / Number(b);
                else
                    throw new Error('Division by zero');
            });
            return evaluate(newExpr);
        }
        else if(add.test(expr))
        {
            let newExpr = expr.replace(add, function(match, a, b) {
                return Number(a) + Number(b);
            });
            return evaluate(newExpr);
        }
        else if(sub.test(expr))
        {
            let newExpr = expr.replace(sub, function(match, a, b) {
                return Number(a) - Number(b);
            });
            return evaluate(newExpr);
        }
        else
        {
            return expr;
        }
    }
    return Number(expr);
}
// Example usage
//console.log(evaluate("2 + 4*(30/5) - 34 + 45/2"));

// Inspired from https://stackoverflow.com/a/16046607
function getHashValue(name)
{
    // For example... passing a name parameter of "name1" will return a value of "100", etc.
    // page.htm#name1=100&name2=101&name3=102

    var winURL = window.location.href;
    var queryStringArray = winURL.split("#");
    var queryStringParamArray = queryStringArray[1].split("&");
    var nameValue = null;

    for ( var i=0; i<queryStringParamArray.length; i++ )
    {           
        queryStringNameValueArray = queryStringParamArray[i].split("=");

        if ( name == queryStringNameValueArray[0] )
        {
            nameValue = queryStringNameValueArray[1];
        }                       
    }

    return nameValue;
}



jQuery(function ($) {
	
	
	

	
	// "colorize" the widget name
	$.widget("ui.devis", {
		// default options
		options: {
			devisID: null, //, //17727
			//devisID:87627
			baseUrl: null, //baseUrl,
			historyUrl: 'https://tabatabai.dev/devis/history_handler.php',
			readonly: false,
			mode: 'local',
			onChange: function(data) {
				if (window.parent) {
					let message = {
						'type': 'changed_devis',
						'data': data
					};
					
					window.parent.postMessage(JSON.stringify(message), '*');
				}
			},
			displayActions: function(self){
			},
			CR_chantier: false,//faut ajouter la class "cr_chantier" pour chatbot CR Chantier dans le form-builder "Admin"
			multiDevis: false,
			pricePopup: false,
			inputRangeName: "etat_avancement",
			rangeThName: 'Etat d\’avancement',
			totalsBefore: false,
			inputName: false,
			chatbotMode: false,
			avancementRounding: 5,
			token: 'ezrg252er4hZED2F4eth2qedfZ'
		},
		
		changeTimeoutID: null,
		history: [],
		historyIndex: null,
		historySaveMode: true,
		canExit: true,
		clipboard: [],

		// the constructor
		_create: function () {
			var self = this;
			
			this.options.readonly = false; //this.element.closest('.o_form_readonly').length > 0;
			
			this.ignoreChanges = false;
			
			this.initialData = [];
			this.cachedMultipleDevisData = null;

			// if inside menu and menu invisible
			let $menus = $('.nav-tabs li');
			if ($menus.length > 0 && $($menus[1]).hasClass('o_invisible_modifier')) {
				return;
			}
			
			if (this.options.mode == 'ai6') {
				if (!this.options.devisID) {
					this.options.devisID = parseInt(getHashValue('id'));
				}
			}
			
			if (!this.options.baseUrl) {
				let getUrl = window.location;
				let baseUrl = getUrl.protocol + "//" + getUrl.host;
				
				if (baseUrl == 'http://localhost') {
					baseUrl = 'https://tabatabai-group-bis-detcom-staging-2022-02-09-4414138.dev.odoo.com';
				}
				
				this.options.baseUrl = baseUrl;
			}
			
			this.els = {};
			
			this.is_debourse = false;
			this.readonly = '';
			if (this.options.inputName) {
				this.els.input = $('<input type="hidden"/>');
				this.els.input.attr('name', this.options.inputName);
				this.els.input.appendTo(this.element);

			}
			if(this.element.hasClass('cr_chantier')){
				this.options.CR_chantier = true;
				this.options.multiDevis = true;
				this.readonly = 'readonly="readonly"';
			}
			
			this.popup_container = $('<div class="so_popup_container"></div>');
			this.popup_container.appendTo(this.element);
			
			this.popup = $('<div class="so_popup"></div>');
			this.popup.appendTo(this.popup_container);
			
			
			this.parameters = $('<div class="so_parameters"></div>');
			this.parameters.appendTo(this.element);
			
			this.is_debourse_div = $('<div class="so_debourse_area"></div>');
			this.is_debourse_div.appendTo(this.parameters);
			this.is_debourse_checkbox = $('<input type="checkbox" id="is_debourse" />');
			this.is_debourse_checkbox.appendTo(this.is_debourse_div);
			$('<label for="is_debourse">Déboursé sec</label></div>').appendTo(this.is_debourse_div);

			this.optionsDevis = $('<div class="options_devis d-none"></div>').appendTo(this.element);
			this.optionsDevisLabel = $('<label/>').attr('for',this.options.inputName+'_select').html('Devis : ').appendTo(this.optionsDevis);
			this.optionsDevisSelect = $('<select/>').attr('id',this.options.inputName+'_select').appendTo(this.optionsDevis);
			
			this.table = $('<table class="so_main_table"></table>');
			this.table.appendTo(this.element);
			let rangeThName = self.options.rangeThName ? self.options.rangeThName : "Completion";
			this.head = $('<thead><tr><th>Section</th><th>Intitulé</th><th class="equation_col">Equation</th><th>Quantité</th><th>Unité</th><th class="so_prix_revient_unitaire">Pr. Rev. U.</th><th class="so_product_unit_price_th">Pr. Vente U.</th><th class="so_prix_revient_total">Pr. Rev. Tot.</th><th class="so_product_total_price_th">Pr. Vente Tot.</th><th class="so_completion">'+rangeThName+'</th><th class="so_vetuste">Vetusté (%)</th><th class="so_actions_th">Actions</th></tr></thead>');
			this.head.appendTo(this.table);
			
			this.actions = $('<div class="so_actions_tab"></div>');
			if (!this.options.totalsBefore) {
				this.actions.appendTo(this.element);
			}
			
			this.add_product_button = $('<button id="add_product" class="btn btn-secondary">Ajouter article</button>');
			this.add_product_button.appendTo(this.actions);
			this.add_product_button = $('<button id="add_subproduct" class="btn btn-secondary">Ajouter sous-article</button>');
			this.add_product_button.appendTo(this.actions);
			this.add_section_button = $('<button id="add_section" class="btn btn-secondary">Ajouter section</button>');
			this.add_section_button.appendTo(this.actions);
			this.add_comment_button = $('<button id="add_comment" class="btn btn-secondary">Ajouter commentaire</button>');
			this.add_comment_button.appendTo(this.actions);
			
			
			this.select_model_div = $('<div class="select_model_area"><label for="select_model">Choisir un modèle : </label></div>');
			this.select_model = $('<input id="select_model" />');
			this.select_model.appendTo(this.select_model_div);
			this.select_model_div.appendTo(this.actions);
			
			
			this.select_model.autocomplete({
				source: function(request, response) {
					$.getJSON(self.getUrl("/sub_product/search_model"), { id: self.options.devisID, term: request.term }, response);
				},
				minLength: 2,
				select: function( event, ui ) {
					$.getJSON(self.getUrl("/sub_product/get_model"), { id: self.options.devisID, model_id: ui.item.id }, function(data) {
						self.setData([]);
						for (let i in data) {
							let $itemTr = self.addItem(data[i]['display_type'], false, data[i]);
							
							if (self.is_debourse) {
								for (let j = 0; j < data[i].subproducts.length; j++) {
									self.addItem('line_subproduct', false, data[i].subproducts[j]);
								}
							}
						}
					});
				}
			});
			
			
			
			this.select_history_div = $('<div class="history_area"><label for="select_history">Revenir à une ancienne version : </label></div>');
			this.select_history = $('<select id="select_history" class="btn btn-secondary"></select>');
			this.select_history.appendTo(this.select_history_div);
			this.select_history_div.appendTo(this.actions);
			
			
			this.totals = $('<table class="so_totals"></table>');
			this.totals.appendTo(this.element);
			
			if (this.options.totalsBefore) {
				this.actions.appendTo(this.element);
			}
			
			
			this.total_ht = $('<tr class="so_total_ht"><td class="so_totals_label"><label>Montant HT :</label></td><td class="so_totals_value"></td></tr>');
			this.total_ht.appendTo(this.totals);

			if (this.options.pricePopup) {
				this.total_ht_popup = $('<div class="so_total_ht_popup"></div>');
				this.total_ht_popup.appendTo(this.element);
			}


			this.total_taxes = $('<tr class="so_total_taxes"><td class="so_totals_label"><label>TVA (<select class="so_totals_tva"><option value="10">10%</option><option value="20">20%</option></select>):</label></td><td class="so_totals_value"></td></tr>');
			this.total_taxes.appendTo(this.totals);
			this.total_ttc = $('<tr class="so_total_ttc"><td class="so_totals_label"><label>Montant TTC :</label></td><td class="so_totals_value"></td></tr>');
			this.total_ttc.appendTo(this.totals);
			
			this.total_ht_value = this.total_ht.find('.so_totals_value');
			this.total_taxes_value = this.total_taxes.find('.so_totals_value');
			this.total_tva = this.total_taxes.find('.so_totals_tva');
			this.total_ttc_value = this.total_ttc.find('.so_totals_value');
			
			
			this.body = $('<tbody></tbody>');
			this.body.appendTo(this.table);
			
			if (this.options.mode == 'ai6') {
				$.get(this.getUrl("/sub_product/get_data"), {'id': this.options.devisID}, function(data) {
					self.initialize();
					
					$.post(self.options.historyUrl, {'id': self.options.devisID, 'instance': self.options.baseUrl}, function(data) {
						self.updateHistory(data['list']);
					}, 'json');
				}, 'json');
			}
			if (this.options.mode == 'local') {
				this.initialize(false);
			}

		},
		
		initialize: function(data) {
			let self = this;
			if(!self.options.CR_chantier){
				Sortable.create(this.body[0], {
					multiDrag: true,
					animation: 150,
					forceFallback: true,
					ghostClass: 'background_item',
					onEnd: function (evt) {
						self.refresh();
					},
					'handle': '.so_num'
				});
			}
			
			
			this._initEvents();
			this.ignoreChanges = true;
			if (data) {
				this.setFullData(data);
			}
			this.ignoreChanges = false;
			this.initialData = data;

			this.options.displayActions(self);
			
			let $chatbotInstance = this.element.closest('.chatbot-instance');
			$chatbotInstance.on('on_form_completed', function() {
				if (self.els.input.val()) {
					self.setFullData(JSON.parse(self.els.input.val()));
				}
			})
			
		},
		
		getUrl: function(relativeUrl) {
			return this.options.baseUrl + relativeUrl + '?token=ezrg252er4hZED2F4eth2qedfZ';
		},
		
		getUUID: function() {
			return uniqueID();
		},

		displaySelectDevis: function(){
			var self = this;
			//let inputDataDevis = self.els.input.val();
			//let data = null;
			//if(inputDataDevis && inputDataDevis != ""){
			//	data = JSON.parse(inputDataDevis);
			//}

			let data = self.cachedMultipleDevisData;

			if(data && data != ""){
				let len = data.length;
				
				self.optionsDevisSelect.empty();
				for (let i = 0; i < len; i++) {

					let displayName = data[i].name;
					if (data[i].titre_devis) {
						displayName += ' - ' + data[i].titre_devis;
					}
					let $option = $('<option/>')
						.attr('name', displayName)
						.attr('value', data[i].id)
						.attr('data-devisId', data[i].id)
						.attr('data-devisName', data[i].name)
						.text(displayName);
					self.optionsDevisSelect.append($option)
				}

				
				self.selectDevis(data[0].id);
				/*
				if(self.options.CR_chantier || self.options.multiDevis){
					self.setFullData(data[0].data) //Pour afficher premiere devis par apport à les options dans le select devis
				}else{
					self.setFullData(data.data)
				}
				*/
			}
		},

		
		getColumn: function(str, colspan) {
			if (typeof colspan == 'undefined') {
				colspan = 1;
			}
			return $('<td class="ds_column"></td>').attr('colspan', colspan).addClass(str);
		},
		
		addItem: function(display_type, fromTr, data, ignoreRefresh) {

			let $tr = $('<tr class="list-group-item"></tr>')
				.data('display_type', display_type)
				.addClass('type_' + display_type);
			
			if(this.options.CR_chantier){
				$tr.attr('data-line_id',data.line_id)
				$tr.attr('data-product_uom',data.product_uom)
				$tr.attr('data-sequence',data.sequence)
				$tr.attr('data-product_id',data.product_id)
				$tr.attr('unit_cost',data.unit_cost)
			}
				
			if (data && data['uuid']) {
				$tr.data('uuid', data['uuid']);
			} else {
				$tr.data('uuid', this.getUUID());
			}
			
			if (typeof fromTr == 'undefined' || !fromTr) {
				this.body.append($tr);
			} else {
				fromTr.after($tr);
			}
				
			if (typeof data == 'undefined') {
				data = {};
			}
			
			if (!display_type) {
				display_type = 'line_product';
			}
			
			this['_addItem_' + display_type]($tr, data);
			
			if (!ignoreRefresh) {
				this.refresh();
			}
			
			return $tr;
		},
		
		
		_addItem_line_section: function($tr, data) {
		
			let self = this;
		
			
			let level =  0;
			let $num = $('<span>1</span>');
			if (data['indexes']) {
				$num.text(data['indexes']);
				level = data['indexes'].split('.').length - 1;
			}
			
			$tr.data('level', level);
			
			let $num_col = this.getColumn('so_num');
			$num_col.append($num);
			
			$tr.append($num_col);
			
		
			let $input_description = $('<input class="section_title" type="text" placeholder="Titre section" '+self.readonly+' />');
			if (data['name']) {
				$input_description.val(data['name']);
			}
			
			if (this.options.mode == 'ai6') {
				$input_description.autocomplete({
					source: function(request, response) {
						$.getJSON(self.getUrl("/sub_product/get_section"), { id: self.options.devisID, term: request.term }, 
								  response);
					},
					minLength: 2,
					select: function( event, ui ) {
						let $this = $(this);
						
						for (let i in ui.item.lines) {
							let $itemTr = self.addItem('', $tr, ui.item.lines[i]);
							
							if (self.is_debourse) {
								for (let j = 0; j < ui.item.lines[i].subproducts.length; j++) {
									self.addItem('line_subproduct', $itemTr, ui.item.lines[i].subproducts[j]);
								}
							}
						}
						
						self.refresh();
					}
				});
			}
			$tr.append(this.getColumn('so_section_title').append($input_description));
			
			
			let $input_equation = $('<span></span>');
			$tr.append(this.getColumn('so_product_equation').append($input_equation));
			
			let $input_quantity = $('<span></span>');
			$tr.append(this.getColumn('so_product_quantity').append($input_quantity));
			
			
			let $input_unit = $('<span></span>');
			$tr.append(this.getColumn('so_product_unit').append($input_unit));
			
			
			let $input_unit_price = $('<span></span>');
			$tr.append(this.getColumn('so_product_unit_price').append($input_unit_price));
			
			
			let $input_prix_revient_unitaire = $('<span></span>');
			$tr.append(this.getColumn('so_prix_revient_unitaire').append($input_prix_revient_unitaire));
			
			let $input_prix_revient_total = $('<input type="text" class="product_prix_revient_total" placeholder="" readonly="readonly"/>');
			$tr.append(this.getColumn('so_prix_revient_total').append($input_prix_revient_total));
			
			let $input_total_price = $('<input type="text" class="product_total_price" placeholder="" readonly="readonly"/>');
			$tr.append(this.getColumn('so_product_total_price').append($input_total_price));
			
			
			
			let $input_completion = $('<span></span>');
			$tr.append(this.getColumn('so_completion').append($input_completion));

			
			let $input_vetuste = $('<span></span>');
			$tr.append(this.getColumn('so_vetuste').append($input_vetuste));
			
			
			let $input_actions = this.completeActions($('<div class="actions"><div class="action_move_down" title="Diminuer d\'un niveau"><i class="fa fa-arrow-left"></i></div><div class="action_move_up" title="Augmenter d\'un niveau"><i class="fa fa-arrow-right"></i></div></div>'));
			$tr.append(this.getColumn('so_actions').append($input_actions));
			
		},
		
		_addItem_line_note: function($tr, data) {
			var self = this
			
			let $num = $('<span></span>');
			
			$tr.append(this.getColumn('so_num').append($num));
			
			let $input_description = $('<textarea onkeyup="textAreaAdjust(this)" style="overflow:hidden" type="text" class="comment_description" placeholder="Commentaire"  '+self.readonly+' ></textarea>');
			if (data['name']) {
				$input_description.val(data['name']);
			}
			$tr.append(this.getColumn('so_comment').append($input_description));
			textAreaAdjust($input_description[0]);
			
			let $input_equation = $('<span></span>');
			$tr.append(this.getColumn('so_product_equation').append($input_equation));
			
			let $input_quantity = $('<span></span>');
			$tr.append(this.getColumn('so_product_quantity').append($input_quantity));
			
			
			let $input_unit = $('<span></span>');
			$tr.append(this.getColumn('so_product_unit').append($input_unit));
			
			let $input_prix_revient_unitaire = $('<span></span>');
			$tr.append(this.getColumn('so_prix_revient_unitaire').append($input_prix_revient_unitaire));
			
			let $input_unit_price = $('<span></span>');
			$tr.append(this.getColumn('so_product_unit_price').append($input_unit_price));
			
			let $input_prix_revient_total = $('<span></span>');
			$tr.append(this.getColumn('so_prix_revient_total').append($input_prix_revient_total));
			
			let $input_total_price = $('<span class="total_price"></span>');
			$tr.append(this.getColumn('so_product_total_price').append($input_total_price));
			
			
			let $input_completion = $('<span></span>');
			$tr.append(this.getColumn('so_completion').append($input_completion));

			
			let $input_vetuste = $('<span></span>');
			$tr.append(this.getColumn('so_vetuste').append($input_vetuste));
			
			let $input_actions = this.completeActions($('<div class="actions"></div>'));
			$tr.append(this.getColumn('so_actions').append($input_actions));
			
		},
		
		_addItem_line_product: function($tr, data) {
		
			let self = this;
			
			let $num = $('<span>1.</span>');
			if (data['indexes']) {
				$num.text(data['indexes']);
			}
			
			$tr.append(this.getColumn('so_num').append($num));
			
			let $input_description = $('<textarea onkeyup="textAreaAdjust(this)" style="overflow:hidden" type="text" class="product_description" placeholder="Intitulé"  '+self.readonly+' ></textarea>');
			if (data['name']) {
				$input_description.val(data['name']);
			}
			if (this.options.mode == 'ai6') {
				$input_description.autocomplete({
					source: function(request, response) {
						$.getJSON(self.getUrl("/sub_product/search_product"), { id: self.options.devisID, term: request.term }, 
								  response);
					},
					minLength: 2,
					select: function( event, ui ) {
						let $this = $(this);
						let $tr = $this.closest('tr');
						//ui.item.id
						$tr.find('.product_unit').val(ui.item.unit);
						$tr.find('.product_unit_price').val(ui.item.unit_price);
						let $quantity = $tr.find('.product_quantity');
						if (!$quantity.val() || toValidNumber($quantity.val()) == 0) {
							$quantity.val(1);
						}
						if (self.is_debourse) {
							for (let i = 0; i < ui.item.subproducts.length; i++) {
								self.addItem('line_subproduct', $tr, ui.item.subproducts[i]);
							}
						}
						self.refresh();
					}
				});
			}
			$tr.append(this.getColumn('so_product_name').append($input_description));
			
			textAreaAdjust($input_description[0]);
			
			let $input_equation = $('<input type="text" class="product_equation" placeholder="" '+self.readonly+'/>');
			if (data['equation']) {
				$input_equation.val(data['equation']);
			}
			$tr.append(this.getColumn('so_product_equation').append($input_equation));
			
			let $input_quantity = $('<input type="text" pattern="[0-9]+([,][0-9]{1,3})?" class="product_quantity" placeholder="Quantité" '+self.readonly+'/>');
			if (data['product_uom_qty']) {
				$input_quantity.val(data['product_uom_qty']);
			}
			$tr.append(this.getColumn('so_product_quantity').append($input_quantity));
			
			
			let $input_unit = $('<input type="text" class="product_unit" placeholder="Unité" '+self.readonly+'/>');
			if (data['uom']) {
				$input_unit.val(data['uom']);
			}
			$input_unit.autocomplete({
				source: units
			});
			$tr.append(this.getColumn('so_product_unit').append($input_unit));
			
			let $input_prix_revient_unitaire = $('<input type="text" class="product_prix_revient_unitaire" placeholder="" readonly="readonly"/>');
			$tr.append(this.getColumn('so_prix_revient_unitaire').append($input_prix_revient_unitaire));
			
			let $input_unit_price = $('<input type="text" class="product_unit_price" placeholder="Prix unitaire" '+self.readonly+'/>');
			if (data['price_unit']) {
				$input_unit_price.val(toFixedFrench(data['price_unit'], 2));
			}
			$tr.append(this.getColumn('so_product_unit_price').append($input_unit_price));
			
			let $input_prix_revient_total = $('<input type="text" class="product_prix_revient_total" placeholder="" readonly="readonly"/>');
			$tr.append(this.getColumn('so_prix_revient_total').append($input_prix_revient_total));
			
			let $input_total_price = $('<input type="text" class="product_total_price" placeholder="" readonly="readonly"/>');
			$tr.append(this.getColumn('so_product_total_price').append($input_total_price));
			
			
			let $input_completion = $('<input type="range" class="product_qty_delivered" min="0" value="0" max="1" />');
			let $percentage_container = $('<div class="percentage_container"/>');
			let $percentage_input = $('<input type="number" class="percentage_avancement" min="0" max="100" step="0.01"/>')
				.css('width','120')
				.appendTo($percentage_container);
			let $percentage_span = $('<span class="span_percentage_avancement">%</span>').appendTo($percentage_container);
			//let $percentage_completion = $('<p class="percentage_avancement"/>').css('display','none');

			let percent = 0;	

			if(data['qty_delivered'] && data['product_uom_qty'] ){
				percent = ((parseFloat(data['qty_delivered'])*100)/(parseFloat(data['product_uom_qty']))).toFixed(2);
			}else{
				percent = (parseFloat($input_completion.val()))*100/(parseFloat($input_quantity.val())).toFixed(2)
			}

			$percentage_input.val(percent)
			//$percentage_completion.text(percent+'%')
			if (percent < 30) {
				$percentage_input.css({'color': 'red'});
				} else if (percent > 31 && percent < 70) {
					$percentage_input.css({'color': '#c1a407'});
				} else if (percent > 70) {
					$percentage_input.css({'color': 'green'});
			}

			if (data['product_uom_qty']) {
				$input_completion.attr('max', data['product_uom_qty']);
				$input_completion.attr('step', data['product_uom_qty'] / 1000);
			}

			if (data['qty_delivered']) {
				$input_completion.val(data['qty_delivered']);
			}

			$tr.append(this.getColumn('so_completion').append($percentage_container, $input_completion));


			let $input_vetuste = $('<input type="text" class="product_vetuste" placeholder=""/>');
			$tr.append(this.getColumn('so_vetuste').append($input_vetuste));

			if (data['vetuste']) {
				$input_vetuste.val(toFixedFrench(data['vetuste'], 2));
			}
			
			let $input_actions = this.completeActions($('<div class="actions"><div class="action_search action_search_customer"><i class="fa fa-search" title="Rechercher dans les anciennes factures"></i></div></div>'));
			//let $input_actions = $('<div class="actions"><div class="action_add_section">As</div><div class="action_add_comment">Ac</div><div class="action_add_product">Ap</div><div class="action_delete">X</div></div>');
			$tr.append(this.getColumn('so_actions').append($input_actions));
		
		},
		
		_addItem_line_subproduct: function($tr, data) {
			let self = this;
			
			let $num = $('<span>1.</span>');
			if (data['indexes']) {
				$num.text(data['indexes']);
			}
			
			$tr.append(this.getColumn('so_num').append($num));
			
			let $input_description = $('<textarea onkeyup="textAreaAdjust(this)" style="overflow:hidden" type="text" class="product_description" placeholder="Intitulé"  '+self.readonly+' ></textarea>');
			if (data['name']) {
				$input_description.val(data['name']);
			}
			$input_description.autocomplete({
				source: function(request, response) {
					$.getJSON(self.getUrl("/sub_product/search_product"), { id: self.options.devisID, term: request.term, include_subproduct: 1 }, 
							  response);
				},
				minLength: 2,
				select: function( event, ui ) {
					let $this = $(this);
					let $tr = $this.closest('tr');
					//ui.item.id
					$tr.find('.product_unit').val(ui.item.unit);
					$tr.find('.product_prix_revient_unitaire').val(ui.item.standard_price);
					let $quantity = $tr.find('.product_quantity');
					if (!$quantity.val()) {
						$quantity.val(1);
					}
					self.refresh();
				}
			});
			$tr.append(this.getColumn('so_product_name').append($input_description));
			
			textAreaAdjust($input_description[0]);
			
			let $input_equation = $('<input type="text" class="product_equation" placeholder="" '+self.readonly+'/>');
			if (data['equation']) {
				$input_equation.val(data['equation']);
			}
			$tr.append(this.getColumn('so_product_equation').append($input_equation));
			
			let $input_quantity = $('<input type="text" pattern="[0-9]+([,][0-9]{1,3})?" class="product_quantity" placeholder="Quantité" '+self.readonly+'/>');
			if (data['product_uom_qty']) {
				$input_quantity.val(data['product_uom_qty']);
			}
			$tr.append(this.getColumn('so_product_quantity').append($input_quantity));
			
			
			let $input_unit = $('<input type="text" class="product_unit" placeholder="Unité" '+self.readonly+'/>');
			if (data['uom']) {
				$input_unit.val(data['uom']);
			}
			$input_unit.autocomplete({
				source: units
			});
			$tr.append(this.getColumn('so_product_unit').append($input_unit));
			
			let $input_prix_revient_unitaire = $('<input type="text" class="product_prix_revient_unitaire" placeholder="" '+self.readonly+'/>');
			if (data['unit_cost']) {
				$input_prix_revient_unitaire.val(data['unit_cost']);
			}
			$tr.append(this.getColumn('so_prix_revient_unitaire').append($input_prix_revient_unitaire));
			
			let $input_unit_price = $('<span></span>');
			$tr.append(this.getColumn('so_product_unit_price').append($input_unit_price));
			
			let $input_prix_revient_total = $('<input type="text" class="product_prix_revient_total" placeholder="" '+self.readonly+'/>');
			$tr.append(this.getColumn('so_prix_revient_total').append($input_prix_revient_total));
			
			let $input_total_price = $('<span></span>');
			$tr.append(this.getColumn('so_product_total_price').append($input_total_price));
			
			
			
			let $input_completion = $('<span></span>');
			$tr.append(this.getColumn('so_completion').append($input_completion));
			
			let $input_actions = this.completeActions($('<div class="actions"><div class="action_search action_search_supplier"><i class="fa fa-search" title="Rechercher dans les anciennes factures"></i></div></div>'));
			//let $input_actions = $('<div class="actions"><div class="action_add_section">As</div><div class="action_add_comment">Ac</div><div class="action_add_product">Ap</div><div class="action_delete">X</div></div>');
			$tr.append(this.getColumn('so_actions').append($input_actions));
		
		},
		
		refreshAllTextareasSizes: function() {
			this.element.find('textarea').each(function() {
				textAreaAdjust(this);
			});
		},		
		
		completeActions: function($div) {
			$div.append($('<div class="action_add_product" title="Ajouter article"></div><div class="action_add_subproduct" title="Ajouter sous-article"></div><div class="action_add_section" title="Ajouter section"></div><div class="action_add_comment" title="Ajouter commentaire"></div><div class="action_delete" title="Supprimer"><i style="color: red;" class="fa fa-times"></i></div>'));
			return $div;
		},
		
		_initEvents: function() {
			var self = this;
			this.element.on('click', '.action_delete', function() {
				$(this).closest('tr').remove();
				self.refresh();
			});
			this.element.on('click', '.action_move_down', function() {
				let $tr = $(this).closest('tr');
				let level = $tr.data('level');
				level = Math.max(level - 1, 0);
				$tr.data('level', level);
				self.refresh();
			});
			this.element.on('click', '.action_move_up', function() {
				let $tr = $(this).closest('tr');
				let level = $tr.data('level');
				level += 1;
				$tr.data('level', level);
				self.refresh();
			});
			this.element.on('click', '.action_add_section', function() {
				self.addItem('line_section', $(this).closest('tr'));
			});
			this.element.on('click', '.action_add_comment', function() {
				self.addItem('line_note', $(this).closest('tr'));
				
			});
			this.element.on('click', '.action_add_product', function() {
				self.addItem('', $(this).closest('tr'));
			});
			this.element.on('click', '.action_add_subproduct', function() {
				self.addItem('line_subproduct', $(this).closest('tr'));
			});
			
			this.element.on('click', '.action_search', function() {
				let $tr = $(this).closest('tr');
				let term = $tr.find('.product_description').val();
                let searchType = 'customer';
                if ($(this).hasClass('action_search_supplier')) {
                    searchType = 'supplier';
                }
				self.popup_container.addClass('active');
				self.popup.empty();
				self.popup.html('<div style="text-align: center; margin-top: 64px; font-size: 2em;">Chargement en cours...</div>');
				$.get(self.getUrl("/sub_product/get_close_lines"), {'id': self.options.devisID, 'term': term, 'type': searchType}, function(data) {
					self.popup.empty();
					let $table = $('<table class="so_main_table so_search_table" style="width: 100%;"></table>');
					$table.appendTo(self.popup);
					$table.data('tr', $tr);
					let $th = $('<thead><tr style="height: 3em;"><th>Intitulé</th><th style="width: 10%">Prix unitaire</th><th style="width: 10%">Unité</th><th style="width: 15%">Agence</th><th style="width: 5%">Année</th><th style="width: 8%">Facture</th></tr></thead>');
					$th.appendTo($table);
					let $tbody = $('<tbody></tbody>');
					$tbody.appendTo($table);
					
					let lines = data.data;
					for (let i = 0; i < lines.length; i++) {
						let $tr = $('<tr style="height: 3em;"></tr>');
						$tr.append($('<td style="padding: 3px;"></td>').text(lines[i].name));
						$tr.append($('<td style="padding: 3px; text-align: right;"></td>').text(toFixedFrench(lines[i].price_unit, 2)));
						$tr.append($('<td style="text-align: center;"></td>').text(lines[i].uom));
						$tr.append($('<td style="text-align: center;"></td>').text(lines[i].agence));
						$tr.append($('<td style="text-align: center;"></td>').text(lines[i].invoice_date));
						$tr.append($('<td style="text-align: center;"></td>').text(lines[i].ref_facture));
						$tbody.append($tr);
						$tr.data('data', lines[i]);
					}
					
					
				}, 'json');
			});
			
			this.element.on('click', '.so_popup_container', function(e) {
				if ($(e.target).closest('.so_popup').length == 0) {
					$(this).removeClass('active');
				}
			});
			
			$('#add_section').click(function() {
				self.addItem('line_section');
			});
			$('#add_product').click(function() {
				self.addItem('');
			});
			$('#add_subproduct').click(function() {
				self.addItem('line_subproduct');
			});
			$('#add_comment').click(function() {
				self.addItem('line_note');
			});
			
			this.element.on('keyup', 'input, textarea', function() {
				self.triggerChange();
			});
			
			this.element.on('focus', 'input.product_quantity', function() {
			   $(this).select();
			});
			
			
			this.element.on('change', 'input, textarea', function() {
				let $this = $(this);
				if ($this.hasClass('product_quantity')) {
					quantity = Math.round(toValidNumber($this.val()) * 1000) / 1000;
					$this.val(toFixedFrench(quantity, 3));
				}
				
				if ($this.hasClass('product_unit_price')) {
					quantity = Math.round(toValidNumber($this.val()) * 100) / 100;
					$this.val(toFixedFrench(quantity, 2));
				}
				
				if ($this.hasClass('product_prix_revient_unitaire')) {
					quantity = Math.round(toValidNumber($this.val()) * 100) / 100;
					$this.val(toFixedFrench(quantity, 2));
				}
				
				self.triggerHistoryChange();
			});
			
			this.element.on('dblclick', '.so_num', function() {
				let num = $(this).text();
				let $trs = self.body.find('tr');
				let selected = false;
				$trs.each(function() {
					let $this = $(this);
					let $so_num = $this.find('.so_num');
					let isOn = $so_num.text() == num || ($so_num.text()).startsWith(num + '.');
					if ($so_num.text() != '') {
						selected = isOn;
					}
					if (selected) {
						Sortable.utils.select(this);
					}
				});
			});
			
			
			this.total_tva.on('change', function() {
				self.refresh();
			});
			
			
			this.element.on('keyup', '.product_quantity, .product_unit_price, .product_prix_revient_unitaire, .product_equation', function() {
				let $this = $(this);
				if ($this.hasClass('product_quantity')) {
					$this.closest('tr').find('.product_equation').val('');
				}
				self.recompute($(this).closest('tr'));
			});
			
			this.element.on('change', '.product_quantity, .product_unit_price, .product_prix_revient_unitaire, .product_equation', function() {
				let $this = $(this);
				if ($this.hasClass('product_quantity')) {
					$this.closest('tr').find('.product_equation').val('');
				}
				
				self.recompute($(this).closest('tr'));
			});
			
			this.element.on('click', '.so_search_table tr', function() {
				let $tr = $(this);
				let data = $tr.data('data');
				let $devisTr = $tr.closest('table').data('tr');
				//$devisTr.find('.product_description').val(data.name);
				textAreaAdjust($devisTr.find('.product_description')[0]);
				$devisTr.find('.product_unit').val(data.uom);
				$devisTr.find('.product_unit_price').val(data.price_unit);
				$devisTr.css({backgroundColor: 'yellow'});
				$devisTr.animate({backgroundColor: 'transparent'}, 1000);
				self.popup_container.removeClass('active');
				self.refresh();
			});
			
			$(document).keydown(function(e){
				if( e.which === 90 && e.ctrlKey && e.shiftKey ){
					self.historySaveMode = false;
					if (self.historyIndex == null) {
						self.historyIndex = self.history.length - 1;
					}
					self.historyIndex = Math.min(self.historyIndex + 1, self.history.length - 1);
					self.setData(self.history[self.historyIndex]);
					self.historySaveMode = true;
				}
				else if( e.which === 90 && e.ctrlKey ){
					self.historySaveMode = false;
					if (self.historyIndex == null) {
						self.historyIndex = self.history.length - 1;
					}
					self.historyIndex = Math.max(self.historyIndex - 1, 0);
					
					self.setData(self.history[self.historyIndex]);
					self.historySaveMode = true;
				}
				
				if( (e.which === 67 || e.which === 88) && e.ctrlKey ){
					self.clipboard = self.getData(true);
				}
				
				if( e.which === 86 && e.ctrlKey ){
					let data = self.getData();
					self.appendData(self.clipboard);
				}
				
				if ((e.which == 46 || (e.which === 88 && e.ctrlKey))) {
					self.body.find('tr.sortable-selected').remove();
					self.refresh();
				}
				
			});
			
			window.onbeforeunload = function() {
				if (!self.canExit) {
					return "Certain éléments du devis n'ont pas encore enregistrés. Il suffit de rester quelque secondes supplémentaires sur la page pour que les changements soient enregistrés. Êtes vous sur de quitter la page ?";
				}
			};
			
			this.select_history.change(function() {
				self.rollbackHistoryTo($(this).val());
			});
			
			this.is_debourse_checkbox.change(function() {
				self.is_debourse = self.is_debourse_checkbox.prop('checked');
				self.refreshIsDebourse();
				self.triggerChange();
			});
			
			if (this.options.chatbotMode) {
				let $chatbotInstance = this.element.closest('.chatbot-instance');

				$chatbotInstance.on('before_get_form_data', function() {
					self.els.input.val(JSON.stringify(self.getFullData()));
				});
				
				$chatbotInstance.on('on_form_completed', function() {
					if (self.els.input.val()) {
						let data = JSON.parse(self.els.input.val());
						self.setFullData(data);
					}
				});
			};

			this.element.on('change', '.product_qty_delivered, .percentage_avancement', function(e){
				self.is_modified = true;
				self.cachedMultipleDevisData = self.getFullData();
			})

			this.element.on('input', '.product_qty_delivered', function(e){
				let $this = $(this);
				//let percent_container = $(this).closest('.so_completion').find('.percentage_avancement');
				let percent_input = $this.closest('.so_completion').find('.percentage_avancement');
				let quantite = parseFloat($this.attr('max'));
				let percent = (parseFloat($this.val())*100/quantite).toFixed(2);

				
				percent = Math.round(percent / self.options.avancementRounding) * self.options.avancementRounding;
				$this.val(percent * quantite / 100);
				//percent_container.text(percent+'%');
				percent_input.val(percent);

				if (percent < 30) {
					percent_input.css({
					  'color': 'red'
					});
				  } else if (percent > 31 && percent < 70) {
					percent_input.css({
					  'color': '#c1a407'
					});
				  } else if (percent > 70) {
					percent_input.css({
					  'color': 'green'
					});
				  }
			})

			this.element.on('input', '.percentage_avancement', function(e){
				let $percent_container = $(this).closest('.so_completion').find('.percentage_avancement');
				let $range_input = $(this).closest('.so_completion').find('.product_qty_delivered');
				
				let quantite = parseFloat($range_input.attr('max'));
				let percent = $(this).val();
				$range_input.val(percent*quantite/100);
				
				if (percent < 30) {
					$percent_container.css({'color': 'red'});
				} else if (percent > 31 && percent < 70) {
					$percent_container.css({'color': '#c1a407'});
				} else if (percent > 70) {
					$percent_container.css({'color': 'green'});
				}
			})

			this.element.on('change', '.percentage_avancement', function(e){
				let $percent_container = $(this).closest('.so_completion').find('.percentage_avancement');
				let $range_input = $(this).closest('.so_completion').find('.product_qty_delivered');
				let percent = $(this).val();
				let quantite = parseFloat($range_input.attr('max'));

				if (percent > 100) {
					$range_input.val(quantite);
					$(this).val(100);
					$percent_container.css({'color': 'green'});
				}else if (percent < 0) {
					$range_input.val(0);
					$(this).val(0);
					$percent_container.css({'color': 'red'});
				}
			})

			self.optionsDevisSelect.change(function () {
				self.selectDevis(self.optionsDevisSelect.val());
			});
			
			$('#longueur').click(function(e) {
				e.preventDefault();
				self.addItem(
					'',
					false,
					{
						'product_uom_qty': $(this).data('val'),
						'uom': 'mL',
					}
				);
			});
			
			
			$('#surface').click(function(e) {
				e.preventDefault();
				self.addItem(
					'',
					false,
					{
						'product_uom_qty': $(this).data('val'),
						'uom': 'm²',
					}
				);
			});
			
			$('#volume').click(function(e) {
				e.preventDefault();
				self.addItem(
					'',
					false,
					{
						'product_uom_qty': $(this).data('val'),
						'uom': 'm³',
					}
				);
			});
			
            window.addEventListener('message', function(event) {
                let data = JSON.parse(event.data);
                
                if (data.type == 'change_devis') {
                    let devisData = JSON.parse(data.data);
                    self.setFullData(devisData);
                }
            });
			
		},


		
		refreshIsDebourse: function() {
			this.is_debourse_checkbox.prop('checked', this.is_debourse)
			if (this.is_debourse) {
				this.element.addClass('so_is_debourse');
			} else {
				this.element.removeClass('so_is_debourse');
			}
			this.refreshAllTextareasSizes();
		},
		
		recompute: function($tr) {
			this.refresh(true);
		},
		
		setData: function(data) {
			this.body.empty();
			
			for (let i = 0; i < data.length; i++) {
				this.addItem(data[i]['display_type'], null, data[i], true);
			}
			this.refresh();
		},
		
		appendData: function(data) {
			let $tr = null;
			let $selectedTrs = this.body.find('tr.sortable-selected:last');
			if ($selectedTrs.length > 0) {
				$tr = $selectedTrs;
			}
			
			let $selected = this.body.find('tr.sortable-selected');
			for (let i = 0; i < $selected.length; i++) {
				Sortable.utils.deselect($selected[i]);
			}
		
			for (let i = 0; i < data.length; i++) {
				let itemData = data[data.length - 1 - i];
				let $createdTr = this.addItem(itemData['display_type'], $tr, itemData);
				Sortable.utils.select($createdTr[0]);
			}
		},
		
		getData: function(onlySelected) {
			var self = this;
			let $trs = this.body.find('tr');
			let data = [];
			$trs.each(function() {
				let $this = $(this);
				if (onlySelected && !$this.hasClass('sortable-selected')) {
					return;
				}
				
				let display_type = $this.data('display_type');
				let uuid = $this.data('uuid');
				if (!display_type) {
					display_type = false;
				}
				
				let itemData = {'display_type': display_type};
				if (!onlySelected) {
					itemData['uuid'] = uuid;
				}
				itemData['indexes'] = $this.find('.so_num').text();
				itemData['product_uom_qty'] = 0
				itemData['price_unit'] = 0
				itemData['equation'] = ''
				if (display_type == 'line_section') {
					itemData['name'] = $this.find('.section_title').val();
				}
				if (display_type == 'line_note') {
					itemData['name'] = $this.find('.comment_description').val();
				}
				if (!display_type) {
					itemData['name'] = $this.find('.product_description').val();
					itemData['product_uom_qty'] = parseFloat(toValidNumber($this.find('.product_quantity').val()));
					if (isNaN(itemData['product_uom_qty'])) {
						itemData['product_uom_qty'] = 0;
					}
					itemData['uom'] = $this.find('.product_unit').val();
					itemData['price_unit'] = parseFloat(toValidNumber($this.find('.product_unit_price').val()));
					
					itemData['vetuste'] = parseFloat(toValidNumber($this.find('.product_vetuste').val()));
					if (isNaN(itemData['vetuste'])) {
						itemData['vetuste'] = 0;
					}
					itemData['equation'] = $this.find('.product_equation').val();
					itemData['qty_delivered'] = $this.find('.product_qty_delivered').val();
				}
				
				if (display_type == 'line_subproduct') {
					itemData['name'] = $this.find('.product_description').val();
					itemData['product_uom_qty'] = parseFloat(toValidNumber($this.find('.product_quantity').val()));
					if (isNaN(itemData['product_uom_qty'])) {
						itemData['product_uom_qty'] = 0;
					}
					itemData['uom'] = $this.find('.product_unit').val();
					itemData['unit_cost'] = parseFloat(toValidNumber($this.find('.product_prix_revient_unitaire').val()));
					if (isNaN(itemData['unit_cost'])) {
						itemData['unit_cost'] = 0;
					}
					itemData['equation'] = $this.find('.product_equation').val();
				}

				if(self.options.CR_chantier){
					let lineId = $this.data('line_id');
					let product_uom = $this.data('product_uom')
					let sequence = $this.data('sequence')
					let product_id = $this.data('product_id')
					let unit_cost = $this.data('unit_cost')
					let percentage_avancement = $this.find('.percentage_avancement').val()

					if(lineId && lineId != ''){
						itemData['line_id'] = lineId;
					}

					if(product_uom && product_uom != ''){
						itemData['product_uom'] = product_uom;
					}

					if(sequence && sequence != ''){
						itemData['sequence'] = sequence;
					}

					if(product_id && product_id != ''){
						itemData['product_id'] = product_id;
					}

					if(unit_cost && unit_cost != ''){
						itemData['unit_cost'] = unit_cost;
					}

					if(percentage_avancement && percentage_avancement != ''){
						itemData['percentage_avancement'] = percentage_avancement
					}

				}
				
				data.push(itemData);
			});
			return data;
		},
		
		getFullDataCurrentDevis: function() {
			let data = {};
			data['lines'] = this.getData();
			data['tva'] = this.total_tva.val();
			data['is_debourse'] = this.is_debourse;
			
			if (this.cachedMultipleDevisData && this.devisI && this.cachedMultipleDevisData[this.devisI]['data']['is_modified']) {
				data['is_modified'] = this.cachedMultipleDevisData[this.devisI]['data']['is_modified'];
				this.is_modified = this.cachedMultipleDevisData[this.devisI]['data']['is_modified'];
			} else {
				data['is_modified'] = this.is_modified;
			}
			return data;
		},

		getFullData: function() {
			if (this.options.multiDevis) {
				return this.getFullDataMultiDevis();
			} else {
				return this.getFullDataCurrentDevis();
			}
		},

		getFullDataMultiDevis: function(){
			// Get data and update it with current devis being displayed
			var self = this;
			let devis_id = self.optionsDevisSelect.val();
			let dataMultiDevis = this.cachedMultipleDevisData
			if(dataMultiDevis && dataMultiDevis != 0 && devis_id){
				$.map(dataMultiDevis, function( val, i ) {
					if(val.id == devis_id){			
						let newData = self.getFullDataCurrentDevis()
						val.data = newData;
						//val.is_modified = true
					}
				});
			}
			self.cachedMultipleDevisData = dataMultiDevis;
			return dataMultiDevis
		},

		devis_is_modified: function(){
			var self = this;
			let devis_id = self.optionsDevisSelect.val();
			let dataMultiDevis = this.cachedMultipleDevisData;
			if(dataMultiDevis && dataMultiDevis != 0 && devis_id){
				$.map(dataMultiDevis, function( val, i ) {
					if(val.id == devis_id){			
						val.devis_is_modified = true
					}
				});
			}
			this.cachedMultipleDevisData = dataMultiDevis;
		},

		selectDevis: function(id) {
			var self = this;

			this.devisI = false;

			let data = this.cachedMultipleDevisData; //JSON.parse(this.els.input.val());
			
			$.map(data, function( val, i ) {
				if(val.id == id){
					self.devisI = i;
					self.is_modified = false;
					if (val.data['is_modified']) {
						self.is_modified = val.data['is_modified'];
					}
					self.setCurrentDevis(val.data);
				}
			});
		},

		setCurrentDevis: function(data) {
			let self = this;
			self.setData(data['lines']);
			self.total_tva.val(data['tva']);
			self.is_debourse = data['is_debourse'];
			self.refreshIsDebourse();
			self.refresh();
		},

		setFullData: function(data) {
			var self = this;
			this.cachedMultipleDevisData = data;

			if (this.options.multiDevis) {
				this.setCurrentDevis(data[0]['data']);
				self.optionsDevis.removeClass('d-none');
				self.displaySelectDevis();
			} else{
				this.setCurrentDevis(data);
			}
			self.els.input.val(JSON.stringify(data));
		},
		
		triggerHistoryChange: function() {
			if (this.historySaveMode) {
				let data = this.getData();
				this.history.push(data);
				this.historyIndex = this.history.length - 1;
			}
		},
		
		updateHistory: function(lst) {
			this.select_history.empty();
			this.select_history.append($('<option></option>'));
			for (let i = 0; i < lst.length; i++) {
				let $option = $('<option></option>');
				$option.attr('name', lst[i]);
				$option.attr('value', lst[i]);
				let txt = lst[i];
				txt = txt.split('-');
				txt[0] = txt[0].split('_').reverse().join('/');
				txt[1] = txt[1].replaceAll('_', ':');
				$option.text(txt.join(' à '));
				this.select_history.append($option);
			}
		},
		
		rollbackHistoryTo: function(val) {
			// Warning; only works on single devis
			var self = this;
			$.post(this.options.historyUrl, {'id': this.options.devisID, 'instance': this.options.baseUrl, 'get': val}, function(data) {
				self.setFullData(JSON.parse(data['data']));
				self.updateHistory(data['list']);
			}, 'json');
		},
		
		triggerChange: function() {
			let self = this;
			
			if (this.ignoreChanges) {
				return;
			}
			if(this.options.multiDevis){
				/*
				// self.cachedMultipleDevisData = self.getFullData()
				// self.els.input.val(JSON.stringify(self.getFullData()))
				*/
				
				let data = this.getFullData();
				if (data){
					if(this.cachedMultipleDevisData){
						this.cachedMultipleDevisData = data
						this.els.input.val(JSON.stringify(data))
					}
					
				}
			}
			
			
			
			let message = {
				"type": "cronos",
				"subtype": "devis:on_change",
				"data": this.getFullData()
			};
			
			window.parent.postMessage(JSON.stringify(message), '*');
			
			if (this.options.mode == 'local') {
				if (this.changeTimeoutID) {
					clearTimeout(this.changeTimeoutID);
				}
				this.changeTimeoutID = setTimeout(function() {
					let data = self.getFullData();
					self.options.onChange(data);
					
				}, 100);


				return;
			}
			
			if (parseInt(getHashValue('id')) != this.options.devisID || getHashValue('model') != 'sale.order') {
				return;
			}
			
			if (this.options.readonly) {
				alert('Le devis est en mode lecture seule, merci de cliquer sur le bouton modifier. Il va maintenant revenir sur son état initial.');
				this.ignoreChanges = true;
				this.setFullData(this.initialData);
				this.ignoreChanges = false;
				return;
			}
			
			$('.o_control_panel button').prop('disabled', true);
			$('.o_statusbar_buttons button').prop('disabled', true);
			this.canExit = false;
			if (this.changeTimeoutID) {
				clearTimeout(this.changeTimeoutID);
			}
			this.changeTimeoutID = setTimeout(function() {
				let data = self.getFullData();
				
				$.post(self.options.historyUrl, {'id': self.options.devisID, 'instance': self.options.baseUrl, 'data': JSON.stringify(data)}, function(data) {
					self.updateHistory(data['list']);
				}, 'json');
				
				
				$.post(self.getUrl("/sub_product/set_data"), {'id': self.options.devisID, 'data': JSON.stringify(data)}, function(data) {
					self.canExit = true;
					$('.o_control_panel button').prop('disabled', false);
					$('.o_statusbar_buttons button').prop('disabled', false);
				}, 'json');
				
				
				self.options.onChange(data);
				
			}, 2000);
		},
		
		refresh: function(dontUpdateInputs) {
			function complete_num(num, item_level) {
				while (item_level >= num.length) {
					num.push(0);
				}
				while (item_level < num.length - 1) {
					num.pop();
				}
				return num;
			}
			
			function add_to_num_totals(numTotals, num, total) {
				for (let i = 0; i < num.length; i++) {
					let pnum = num.slice(0, i + 1).join('.');
					if (typeof numTotals[pnum] == 'undefined') {
						numTotals[pnum] = 0;
					}
					numTotals[pnum] += total;
				}
			}
		
			let level = 0;
			let num = [0];
			let $trs = this.body.find('tr');
			let numTotals = {};
			let numTotalsCosts = {};
			let totalHT = 0;
			let lastProductNb = 0;
			$trs.each(function() {
				let $this = $(this);
				
				let display_type = $this.data('display_type');
				
				if (display_type == 'line_section') {
					level = $this.data('level');
				}
				if (display_type == 'line_section' || display_type == '' || display_type == 'line_subproduct') {
					let item_level = level;
					if (display_type == '') {
						item_level += 1;
					}
					if (display_type == 'line_subproduct') {
						item_level += 2;
					}
					num = complete_num(num, item_level);
					num[item_level] += 1;
					if (display_type == '' || display_type == 'line_subproduct') {
						let $quantity = $this.find('.product_quantity');
						let $unit_price = $this.find('.product_unit_price');
						let $prix_revient_unitaire = $this.find('.product_prix_revient_unitaire');
						let $equation = $this.find('.product_equation');
						let equationVal = $equation.val();
						
						equationVal = equationVal.replace(',', '.');
						if (equationVal.trim() != '') {
                            try {
                                ev = evaluate(equationVal);
                            } catch (e) {
                                ev = equationVal;
                            }
							ev = Math.round(ev * 1000) / 1000;
							if (!isNaN(ev)) {
								if (display_type == 'line_subproduct') {
									ev *= lastProductNb;
								}
								
								$quantity.val(toFixedFrench(ev, 3));
							}
						}
						let quantity = parseFloat(toValidNumber($quantity.val()));
						let unit_price = parseFloat(toValidNumber($unit_price.val()));
						let prix_revient_unitaire = parseFloat(toValidNumber($prix_revient_unitaire.val()));
						
						if (display_type == '') {
							lastProductNb = quantity;
						}
						
						if (!dontUpdateInputs) {
								
							let quantityStr = toFixedFrench(quantity, 3);
							if (quantityStr != $quantity.val()) {
								$quantity.val(quantityStr);
							}
							
							let unit_priceStr = toFixedFrench(unit_price, 2);
							if (unit_priceStr != $unit_price.val()) {
								$unit_price.val(unit_priceStr);
							}
							
							let unit_revientStr = toFixedFrench(prix_revient_unitaire, 2);
							if (unit_revientStr != $prix_revient_unitaire.val()) {
								$prix_revient_unitaire.val(unit_revientStr);
							}
						}
						
						let total = 0;
						let totalCost = 0;
						
						if (!Number.isNaN(quantity)) {
							quantity = Math.round(quantity * 1000) / 1000;
						}
						
						if (!Number.isNaN(quantity) && !Number.isNaN(unit_price)) {
							unit_price = Math.round(unit_price * 100) / 100;
							
							total = quantity * unit_price;
							total = Math.round(total * 100) / 100;
							
							totalHT += total;
							
							$this.find('.product_total_price').val(toFixedFrench(total, 2));
						}
						
						
						if (!Number.isNaN(quantity) && !Number.isNaN(prix_revient_unitaire) && display_type == 'line_subproduct') {
							prix_revient_unitaire = Math.round(prix_revient_unitaire * 100) / 100;
							
							totalRevient = quantity * prix_revient_unitaire;
							totalRevient = Math.round(totalRevient * 100) / 100;
							
							totalCost += totalRevient;
							
							$this.find('.product_prix_revient_total').val(toFixedFrench(totalRevient, 2));
						}
						
						add_to_num_totals(numTotals, num, total);
						add_to_num_totals(numTotalsCosts, num, totalCost);
					}
					$this.find('.so_num').text(num.join('.'));
				}
			});
			
			
			$trs.each(function() {
				let $this = $(this);
				let display_type = $this.data('display_type');
				if (display_type == 'line_section') {
					let num = $this.find('.so_num').text();
					let total = numTotals[num];
					$this.find('.product_total_price').val(toFixedFrench(total, 2));
				}
				if (display_type == 'line_section' || !display_type) {
					let num = $this.find('.so_num').text();
					let total = numTotalsCosts[num];
					$this.find('.product_prix_revient_total').val(toFixedFrench(total, 2));
					if (!display_type) {
						let quantity = parseFloat(toValidNumber($this.find('.product_quantity').val()));
						$this.find('.product_prix_revient_unitaire').val(toFixedFrench(total / quantity, 2));
					}
				}
			});
			
			this.total_ht_value.text(toFixedFrench(totalHT, 2) + ' €');

			let newText = 'Total HT : ' + toFixedFrench(totalHT, 2) + ' €';
			if (this.options.pricePopup && this.total_ht_popup.text() != newText) {
				this.total_ht_popup.text(newText);
				this.total_ht_popup.animate({ backgroundColor: 'white', color: "black" }, 50, function() {
					$(this).animate({ backgroundColor: 'black', color: 'white' }, 50);
				});
			}
			
			let total_tva = Math.round(this.total_tva.val() * totalHT) / 100;
			this.total_taxes_value.text(toFixedFrench(total_tva, 2) + ' €');
			
			
			this.total_ttc_value.text(toFixedFrench(totalHT + total_tva, 2) + ' €');
			
			this.triggerChange();
			this.triggerHistoryChange();
		}
	});
	
	
});




