define(["require","exports","module","herocalc_knockout","./herocalc_core"],function(e,t,a){"use strict";var i=e("herocalc_knockout"),o=e("./herocalc_core").HEROCALCULATOR;o.prototype.illusionData={chaos_knight_phantasm:{hero:"chaos_knight",displayName:"Chaos Knight Phantasm",use_selected_hero:!1,max_level:3,outgoing_damage:"outgoing_damage",incoming_damage:"incoming_damage"},naga_siren_mirror_image:{hero:"naga_siren",displayName:"Naga Siren Mirror Image",use_selected_hero:!1,max_level:4,outgoing_damage:"outgoing_damage",incoming_damage:"incoming_damage"},dark_seer_wall_of_replica:{hero:"dark_seer",displayName:"Dark Seer Wall of Replica",use_selected_hero:!0,max_level:3,outgoing_damage:"replica_damage_outgoing",incoming_damage:"replica_damage_incoming",outgoing_damage_scepter:"replica_damage_outgoing_scepter"},morphling_replicate:{hero:"morphling",displayName:"Morphling Replicate",use_selected_hero:!0,max_level:3,outgoing_damage:"illusion_damage_out_pct",incoming_damage:"illusion_damage_in_pct"},phantom_lancer_doppelwalk:{hero:"phantom_lancer",displayName:"Phantom Lancer Doppelwalk",use_selected_hero:!1,max_level:4,outgoing_damage:"illusion_damage_out_pct",incoming_damage:"illusion_damage_in_pct"},phantom_lancer_juxtapose:{hero:"phantom_lancer",displayName:"Phantom Lancer Juxtapose",use_selected_hero:!1,max_level:4,outgoing_damage:"illusion_damage_out_pct",incoming_damage:"illusion_damage_in_pct"},phantom_lancer_spirit_lance:{hero:"phantom_lancer",displayName:"Phantom Lancer Spirit Lance",use_selected_hero:!1,max_level:4,outgoing_damage:"illusion_damage_out_pct",incoming_damage:"illusion_damage_in_pct"},shadow_demon_disruption:{hero:"shadow_demon",displayName:"Shadow Demon Disruption",use_selected_hero:!0,max_level:4,outgoing_damage:"illusion_outgoing_damage",incoming_damage:"illusion_incoming_damage"},spectre_haunt:{hero:"spectre",displayName:"Spectre Haunt",use_selected_hero:!1,max_level:3,outgoing_damage:"illusion_damage_outgoing",incoming_damage:"illusion_damage_incoming"},terrorblade_conjure_image:{hero:"terrorblade",displayName:"Terrorblade Conjure Image",use_selected_hero:!1,max_level:4,outgoing_damage:"illusion_outgoing_damage",incoming_damage:"illusion_incoming_damage"},terrorblade_reflection:{hero:"terrorblade",displayName:"Terrorblade Reflection",use_selected_hero:!0,max_level:4,outgoing_damage:"illusion_outgoing_damage"},item_manta:{hero:"",is_item:!0,displayName:"Manta Style Illusion",use_selected_hero:!0,max_level:1,outgoing_damage_melee:"images_do_damage_percent_melee",incoming_damage_melee:"images_take_damage_percent_melee",outgoing_damage_ranged:"images_do_damage_percent_ranged",incoming_damage_ranged:"images_take_damage_percent_ranged"}},o.prototype.IllusionViewModel=function(e,t,a){var l=new o.prototype.HeroCalculatorModel(0);return l.parent=t,l.inventory=l.parent.inventory,l.illusionType=i.observable(l.parent.selectedIllusion().illusionName),l.illusionDisplayName=i.observable(l.parent.selectedIllusion().illusionDisplayName),l.illusionAbilityLevel(a),l.illusionAbilityMaxLevel=i.observable(o.prototype.illusionData[l.parent.selectedIllusion().illusionName].max_level),o.prototype.illusionData[l.illusionType()].use_selected_hero?l.selectedHero(l.parent.selectedHero()):l.selectedHero(o.prototype.findWhere(l.availableHeroes(),{heroName:l.parent.selectedIllusion().baseHero})),l.selectedHeroLevel(l.parent.selectedHeroLevel()),l.hero=i.computed(function(){return i.mapping.fromJS(o.prototype.heroData["npc_dota_hero_"+l.selectedHero().heroName])}),l.ability().getAttributeBonusLevel=l.parent.ability().getAttributeBonusLevel,l.totalAgi=i.computed(function(){return(l.heroData().attributebaseagility+l.heroData().attributeagilitygain*(l.selectedHeroLevel()-1)+l.inventory.getAttributes("agi")+2*l.ability().getAttributeBonusLevel()+l.ability().getAgility()+l.enemy().ability().getAllStatsReduction()+l.debuffs.getAllStatsReduction()).toFixed(2)}),l.intStolen=i.observable(0).extend({numeric:0}),l.totalInt=i.computed(function(){return(l.heroData().attributebaseintelligence+l.heroData().attributeintelligencegain*(l.selectedHeroLevel()-1)+l.inventory.getAttributes("int")+2*l.ability().getAttributeBonusLevel()+l.ability().getIntelligence()+l.enemy().ability().getAllStatsReduction()+l.debuffs.getAllStatsReduction()+l.intStolen()).toFixed(2)}),l.totalStr=i.computed(function(){return(l.heroData().attributebasestrength+l.heroData().attributestrengthgain*(l.selectedHeroLevel()-1)+l.inventory.getAttributes("str")+2*l.ability().getAttributeBonusLevel()+l.ability().getStrength()+l.enemy().ability().getAllStatsReduction()+l.debuffs.getAllStatsReduction()).toFixed(2)}),l.getAbilityAttributeValue=function(e,t,a,i){if("item_manta"==t)var l=o.prototype.itemData[t];else var l=o.prototype.findWhere(o.prototype.heroData["npc_dota_hero_"+e].abilities,{name:t});var n=o.prototype.findWhere(l.attributes,{name:a});return 0==i?parseFloat(n.value[0]):i>n.length?parseFloat(n.value[0]):parseFloat(n.value[i-1])},l.getIncomingDamageMultiplier=function(e,t,a){return"item_manta"==e?"DOTA_UNIT_CAP_MELEE_ATTACK"==a?1+l.getAbilityAttributeValue(o.prototype.illusionData[l.illusionType()].hero,l.illusionType(),o.prototype.illusionData[e].incoming_damage_melee,l.illusionAbilityLevel())/100:1+l.getAbilityAttributeValue(o.prototype.illusionData[l.illusionType()].hero,l.illusionType(),o.prototype.illusionData[e].incoming_damage_ranged,l.illusionAbilityLevel())/100:1+l.getAbilityAttributeValue(o.prototype.illusionData[l.illusionType()].hero,l.illusionType(),o.prototype.illusionData[e].incoming_damage,l.illusionAbilityLevel())/100},l.getOutgoingDamageMultiplier=function(e,t,a){return"item_manta"==e?"DOTA_UNIT_CAP_MELEE_ATTACK"==a?1+l.getAbilityAttributeValue(o.prototype.illusionData[l.illusionType()].hero,l.illusionType(),o.prototype.illusionData[e].outgoing_damage_melee,l.illusionAbilityLevel())/100:1+l.getAbilityAttributeValue(o.prototype.illusionData[l.illusionType()].hero,l.illusionType(),o.prototype.illusionData[e].outgoing_damage_ranged,l.illusionAbilityLevel())/100:1+l.getAbilityAttributeValue(o.prototype.illusionData[l.illusionType()].hero,l.illusionType(),o.prototype.illusionData[e].outgoing_damage,l.illusionAbilityLevel())/100},l.baseDamage=i.computed(function(){return[Math.floor(o.prototype.heroData["npc_dota_hero_"+l.selectedHero().heroName].attackdamagemin+l.totalAttribute(l.primaryAttribute())+l.ability().getBaseDamage().total)*l.getOutgoingDamageMultiplier(l.illusionType(),!1,l.hero().attacktype()),Math.floor(o.prototype.heroData["npc_dota_hero_"+l.selectedHero().heroName].attackdamagemax+l.totalAttribute(l.primaryAttribute())+l.ability().getBaseDamage().total)*l.getOutgoingDamageMultiplier(l.illusionType(),!1,l.hero().attacktype())]}),l.damage=i.computed(function(){return[l.baseDamage()[0],l.baseDamage()[1]]}),l.ehpPhysical=i.computed(function(){var e=l.health()*(1+.06*l.totalArmorPhysical())/(1-(1-l.inventory.getEvasion()*l.ability().getEvasion()));return e*=l.inventory.activeItems().some(function(e){return"mask_of_madness"==e.item})?1/1.3:1,e*=1/l.getIncomingDamageMultiplier(l.illusionType(),!1,l.hero().attacktype()),e.toFixed(2)}),l.ehpMagical=i.computed(function(){var e=l.health()/l.totalMagicResistanceProduct();return e*=1/l.getIncomingDamageMultiplier(l.illusionType(),!1,l.hero().attacktype()),e.toFixed(2)}),l.totalArmorPhysical=i.computed(function(){return(l.enemy().ability().getArmorBaseReduction()*l.debuffs.getArmorBaseReduction()*(o.prototype.heroData["npc_dota_hero_"+l.selectedHero().heroName].armorphysical+.14*l.totalAgi())+l.ability().getArmor()+l.enemy().ability().getArmorReduction()+l.buffs.getArmor()+l.debuffs.getArmorReduction()).toFixed(2)}),l.ias=i.computed(function(){var e=parseFloat(l.totalAgi())+l.ability().getAttackSpeed()+l.enemy().ability().getAttackSpeedReduction()+l.buffs.getAttackSpeed()+l.debuffs.getAttackSpeedReduction()+l.unit().ability().getAttackSpeed();return-80>e?-80:e>400?400:e.toFixed(2)}),l}});
//# sourceMappingURL=herocalc_hero.illusion.js.map