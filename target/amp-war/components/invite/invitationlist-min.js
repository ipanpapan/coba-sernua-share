(function(){var c=YAHOO.util.Dom,s=YAHOO.util.Event,g=YAHOO.util.Element;var i=Alfresco.util.encodeHTML;Alfresco.InvitationList=function(u){Alfresco.InvitationList.superclass.constructor.call(this,"Alfresco.InvitationList",u,["button","container","datasource","datatable","json"]);this.listWidgets=[];this.uniqueRecordId=1;YAHOO.Bubbling.on("personSelected",this.onPersonSelected,this);return this};YAHOO.extend(Alfresco.InvitationList,Alfresco.component.Base,{options:{siteId:"",roles:[]},listWidgets:null,uniqueRecordId:null,onReady:function k(){if(YAHOO.env.ua.webkit>0){c.setStyle(this.id+"-backTo","vertical-align","sub")}this.widgets.inviteButton=Alfresco.util.createYUIButton(this,"invite-button",this.inviteButtonClick,{additionalClass:"alf-primary-button"});this.widgets.allRolesSelect=Alfresco.util.createYUIButton(this,"selectallroles-button",this.onSelectAllRoles,{type:"menu",menu:"selectallroles-menu"});this.widgets.roleTooltip=new Alfresco.module.RolesTooltip(this.id,this.id+"-role-info","role-info-button",this.options.siteId);this.widgets.dataSource=new YAHOO.util.DataSource([],{responseType:YAHOO.util.DataSource.TYPE_JSARRAY});this._setupDataTable();this._enableDisableInviteButton();var w=this,v=function u(y,x){w.removeInvitee.call(w,x[1].anchor);x[1].stop=true;return true};YAHOO.Bubbling.addDefaultAction("remove-item-button",v);c.setStyle(this.id+"-invitationBar","visibility","visible")},_setupDataTable:function b(){var z=this;var u=function C(I,G,J,K){var D=G.getData(),F=YAHOO.lang.trim(D.firstName+" "+D.lastName),H="",E=D.email;if(D.userName!==undefined&&D.userName.length>0){H="("+D.userName+")"}I.innerHTML='<h3 class="itemname">'+i(F)+' <span class="lighter theme-color-1">'+i(H)+'</span></h3><div class="detail">'+i(E)+"</div>"};var v=function x(P,R,N,E){c.setStyle(P.parentNode,"width",N.width+"px");c.setStyle(P,"overflow","visible");var Q=new g(P),F=R.getData("id"),O=z.id+"-roleselector-"+F;var L=c.get(z.id+"-role-column-template"),G=L.cloneNode(true);G.setAttribute("id","actionsDiv"+F);c.removeClass(G,"hidden");var M=[],J;for(var I=0,H=z.options.roles.length;I<H;I++){J=z.options.roles[I];M.push({text:z.msg("role."+J),value:J,onclick:{fn:z.onRoleSelect,obj:{record:R,role:J},scope:z}})}Q.appendChild(G);var D=c.getElementsByClassName("role-selector-button","button",G);var K=new YAHOO.widget.Button(D[0],{type:"menu",name:O,label:z.getRoleLabel(R)+" "+Alfresco.constants.MENU_ARROW_SYMBOL,menu:M});z.listWidgets[F]={button:K}};var w=function B(E,D,F,H){var G='<span id="'+z.id+'-removeInvitee">  <a href="#" class="remove-item-button"><span class="removeIcon">&nbsp;</span></a></span>';E.innerHTML=G};var y=[{key:"user",label:"User",sortable:false,formatter:u},{key:"role",label:"Role",sortable:false,formatter:v},{key:"remove",label:"Remove",sortable:false,formatter:w}];var A="";if(z.id.indexOf("_invite_")>0){A=this.msg("invitationlist.empty-list")}else{if(z.id.indexOf("_add-users_")>0){A=this.msg("added-users-list.direct-add-instructions")}}this.widgets.dataTable=new YAHOO.widget.DataTable(this.id+"-inviteelist",y,this.widgets.dataSource,{MSG_EMPTY:A})},getRoleLabel:function h(u){if(u.getData("role")!==undefined){return this.msg("role."+u.getData("role"))}return this.msg("invitationlist.selectrole")},onPersonSelected:function t(w,v){var x=v[1],u={id:this.uniqueRecordId++,userName:x.userName||"",firstName:x.firstName,lastName:x.lastName,email:x.email};this.widgets.dataTable.addRow(u);this._enableDisableInviteButton()},removeInvitee:function r(v){var u=this.widgets.dataTable.getRecord(v);YAHOO.Bubbling.fire("personDeselected",{userName:u.getData("userName")});this.widgets.dataTable.deleteRow(u);this._enableDisableInviteButton()},onSelectAllRoles:function q(x,w,v){var u=w[1].value;if(u===""){return}this._setAllRolesImpl(u);this._enableDisableInviteButton();s.preventDefault(w[0])},onRoleSelect:function j(y,x,w){var v=w.role,u=w.record;this._setRoleForRecord(u,v);this._enableDisableInviteButton();s.preventDefault(x[0])},_setAllRolesImpl:function d(u){var y=this.widgets.dataTable.getRecordSet(),v;for(var w=0,x=y.getLength();w<x;w++){v=y.getRecord(w);this._setRoleForRecord(v,u)}this._enableDisableInviteButton()},_setRoleForRecord:function n(u,v){u.setData("role",v);this.listWidgets[u.getData("id")].button.set("label",this.getRoleLabel(u)+" "+Alfresco.constants.MENU_ARROW_SYMBOL)},_checkAllRolesSet:function e(){var x=this.widgets.dataTable.getRecordSet(),u;for(var w=0,v=x.getLength();w<v;w++){u=x.getRecord(w);if(u.getData("role")===undefined){return false}}return true},_enableDisableInviteButton:function l(){var u=this.widgets.dataTable.getRecordSet().getLength()>0&&this._checkAllRolesSet();this.widgets.inviteButton.set("disabled",!u)},inviteButtonClick:function p(z){var x=this.widgets.dataTable.getRecordSet();if(x.getLength()<0||!this._checkAllRolesSet()){this._enableDisableInviteButton();return}this.widgets.inviteButton.set("disabled",true);this.widgets.feedbackMessage=Alfresco.util.PopupManager.displayMessage({text:this.msg("message.please-wait"),spanClass:"wait",displayTime:0});var y=[];for(var w=0,v=x.getLength();w<v;w++){y.push(x.getRecord(w))}var u={recs:y,size:y.length,index:0,successes:[],failures:[]};this._processInviteData(u)},_processInviteData:function o(u){if(u.index>=u.size){this._finalizeInvites(u);return}this._doInviteUser(u)},_doInviteUser:function m(u){var w=u.recs[u.index];var A=function z(B){u.successes.push(u.index);u.index++;this._processInviteData(u)};var x=function v(B){u.failures.push(u.index);u.index++;this._processInviteData(u)};var y=window.location.protocol+"//"+window.location.host+Alfresco.constants.URL_CONTEXT;Alfresco.util.Ajax.request({url:Alfresco.constants.PROXY_URI+"api/sites/"+this.options.siteId+"/invitations",method:"POST",requestContentType:"application/json",responseContentType:"application/json",dataObj:{invitationType:"NOMINATED",inviteeUserName:w.getData("userName")||"",inviteeRoleName:w.getData("role"),inviteeFirstName:w.getData("firstName"),inviteeLastName:w.getData("lastName"),inviteeEmail:w.getData("email"),serverPath:y,acceptURL:"page/accept-invite",rejectURL:"page/reject-invite"},successCallback:{fn:A,scope:this},failureCallback:{fn:x,scope:this}})},_finalizeDirectAdds:function a(u){if(this.id.indexOf("_add-users_")>0){var v=[];var y=u.recs.length;for(var x=0;x<y;x++){for(var w=u.successes.length-1;w>=0;w--){if(u.successes[w]==x){v.push(u.recs[x]._oData)}}}YAHOO.Bubbling.fire("usersAdded",{users:v})}},_finalizeInvites:function f(u){this._finalizeDirectAdds(u);for(var v=u.successes.length-1;v>=0;v--){this.widgets.dataTable.deleteRow(u.successes[v])}this.widgets.feedbackMessage.destroy();if(this.id.indexOf("_add-users_")>0){if(u.failures.length>0){Alfresco.util.PopupManager.displayMessage({text:this.msg("message.failure-adding-users",u.failures.length)})}}else{Alfresco.util.PopupManager.displayMessage({text:this.msg("message.inviteresult",u.successes.length,u.failures.length)})}this._enableDisableInviteButton()}})})();