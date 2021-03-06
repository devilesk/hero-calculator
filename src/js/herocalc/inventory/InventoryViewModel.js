'use strict';
var ko = require('../herocalc_knockout');

var StatModel = require("../StatModel");
var stackableItems = require("./stackableItems");
var levelItems = require("./levelItems");
var BasicInventoryViewModel = require("./BasicInventoryViewModel");
var itemOptionsArray = require("./itemOptionsArray");
var itemBuffOptions = require("./itemBuffOptions");
var itemDebuffOptions = require("./itemDebuffOptions");

var InventoryViewModel = function (itemData, h) {
    var self = this;
    BasicInventoryViewModel.call(this, h);
    self.hero = h;
    self.hasInventory = ko.observable(true);
    self.items = ko.observableArray([]);
    self.activeItems = ko.observableArray([]);
    self.hasScepter = ko.pureComputed(function () {
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            if (item === 'ultimate_scepter' && self.items()[i].enabled()) {
                return true;
            }
        }
        return false;
    }, this);
    self.isEthereal = ko.pureComputed(function () {
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if ((item === 'ghost' || item === 'ethereal_blade') && self.items()[i].enabled() && isActive) {
                return true;
            }
        }
        return false;
    }, this);
    self.isSheeped = ko.pureComputed(function () {
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (item === 'sheepstick' && self.items()[i].enabled() && isActive) {
                return true;
            }
        }
        return false;
    }, this);
    self.totalCost = ko.pureComputed(function () {
        var c = 0;
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            if (!self.items()[i].enabled()) continue;
            if (stackableItems.indexOf(item) != -1) {
                c += itemData['item_' + item].itemcost * self.items()[i].size;
            }
            else if (levelItems.indexOf(item) != -1) {
                switch(item) {
                    case 'travel_boots':
                    case 'necronomicon':
                    case 'dagon':
                        c += itemData['item_' + item].itemcost + (self.items()[i].size - 1) * itemData['item_recipe_' + item].itemcost;
                    break;
                    default:
                        c += itemData['item_' + item].itemcost;
                    break;
                }
            }
            else {
                c += itemData['item_' + item].itemcost;
            }
            
        }
        return c;
    }, this);
    self.addItemBuff = function (data, event) {
        if (self.hasInventory() && self.selectedItemBuff() != undefined) {
            var new_item = {
                item: self.selectedItemBuff().split('|')[0],
                state: ko.observable(0),
                size: 1,
                enabled: ko.observable(true)
            }
            if (self.selectedItemBuff().split('|').length == 2) {
                new_item.buff = self.selectedItemBuff().split('|')[1]
            }
            self.items.push(new_item);
            if (self.selectedItemBuff() === 'ring_of_aquila' || self.selectedItemBuff() === 'ring_of_basilius') {
                self.toggleItem(undefined, new_item, undefined);
            }
        }
    };
    self.addItemDebuff = function (data, event) {
        if (self.hasInventory() && self.selectedItemDebuff() != undefined) {
            var new_item = {
                item: self.selectedItemDebuff().split('|')[0],
                state: ko.observable(0),
                size: 1,
                enabled: ko.observable(true)
            }
            if (self.selectedItemDebuff().split('|').length == 2) {
                new_item.debuff = self.selectedItemDebuff().split('|')[1]
            }
            self.items.push(new_item);
            if (self.selectedItemDebuff() === 'ring_of_aquila' || self.selectedItemDebuff() === 'ring_of_basilius') {
                self.toggleItem(undefined, new_item, undefined);
            }
        }
    };
    
    self.getAttributes = function (attributeType) {
        var sources = new StatModel();
        for (var i = 0; i < self.items().length; i++) {
            var itemId = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            var size = self.items()[i].size;
            var item = itemData['item_' + itemId];
            for (var j = 0; j < item.attributes.length; j++) {
                var attribute = item.attributes[j];
                switch(attribute.name) {
                    case 'bonus_all_stats':
                        sources.add(parseInt(attribute.value[0]), item.displayname);
                    break;
                    case 'bonus_stats':
                        sources.add(parseInt(attribute.value[0]), item.displayname);
                    break;
                }
                switch(attributeType) {
                    case 'agi':
                        switch(attribute.name) {
                            case 'bonus_agility':
                            case 'bonus_agi':
                                sources.add(parseInt(attribute.value[0]), item.displayname);
                            break;
                            case 'bonus_stat':
                                if (self.items()[i].state() == 2) {
                                    sources.add(parseInt(attribute.value[0]), item.displayname);
                                }
                            break;
                        }
                    break;
                    case 'int':
                        switch(attribute.name) {
                            case 'bonus_intellect':
                                if (itemId == 'necronomicon') {
                                    sources.add(parseInt(attribute.value[size-1]), item.displayname);
                                }
                                else if (itemId == 'dagon') {
                                    sources.add(parseInt(attribute.value[size-1]), item.displayname);
                                }
                                else {
                                    sources.add(parseInt(attribute.value[0]), item.displayname);
                                }
                            break;
                            case 'bonus_intelligence':
                            case 'bonus_int':
                                sources.add(parseInt(attribute.value[0]), item.displayname);
                            break;
                            case 'bonus_stat':
                                if (self.items()[i].state() == 1) {
                                    sources.add(parseInt(attribute.value[0]), item.displayname);
                                }
                            break;
                        }
                    break;
                    case 'str':
                        switch(attribute.name) {
                            case 'bonus_strength':
                                if (itemId == 'necronomicon') {
                                    sources.add(parseInt(attribute.value[size-1]), item.displayname);
                                }
                                else {
                                    sources.add(parseInt(attribute.value[0]), item.displayname);
                                }
                            break;
                            case 'bonus_str':
                                sources.add(parseInt(attribute.value[0]), item.displayname);
                            break;
                            case 'bonus_stat':
                                if (self.items()[i].state() == 0) {
                                    sources.add(parseInt(attribute.value[0]), item.displayname);
                                }
                            break;
                            case 'unholy_bonus_strength':
                                if (isActive) {
                                    sources.add(parseInt(attribute.value[0]), item.displayname);
                                }
                            break;
                        }
                    break;
                }
            }
        }
        console.log('getAttributes', sources);
        return sources;
    };
    
    self.getBash = function (attacktype) {
        var totalAttribute = 1;
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                switch(attribute.name) {
                    case 'bash_chance':
                        totalAttribute *= (1 - parseInt(attribute.value[0]) / 100);
                    break;
                    case 'bash_chance_melee':
                        if (attacktype == 'DOTA_UNIT_CAP_MELEE_ATTACK') { totalAttribute *= (1 - parseInt(attribute.value[0]) / 100); };
                    break;
                    case 'bash_chance_ranged':
                        if (attacktype == 'DOTA_UNIT_CAP_RANGED_ATTACK') { totalAttribute *= (1 - parseInt(attribute.value[0]) / 100); };
                    break;
                }
            }
        }
        return totalAttribute;
    };
    
    self.getCritChance = function () {
        var totalAttribute = 1;
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                switch(attribute.name) {
                    case 'crit_chance':
                        totalAttribute *= (1 - parseInt(attribute.value[0]) / 100);
                    break;
                }
            }
        }
        return totalAttribute;
    };
    
    self.getCritSource = function () {
        var sources = {};
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            switch (item) {
                case 'lesser_crit':
                case 'greater_crit':
                case 'bloodthorn':
                    if (sources[item] == undefined) {
                        sources[item] = {
                            'chance': self.getItemAttributeValue(itemData['item_' + item].attributes, 'crit_chance', 0) / 100,
                            'multiplier': self.getItemAttributeValue(itemData['item_' + item].attributes, 'crit_multiplier', 0) / 100,
                            'count': 1,
                            'displayname': itemData['item_' + item].displayname
                        }
                    }
                    else {
                        sources[item].count += 1;
                    }
                break;
            }
            if (item === 'bloodthorn' && isActive) {
                if (sources['soul_rend'] == undefined) {
                    sources['soul_rend'] = {
                        'chance': 1,
                        'multiplier': self.getItemAttributeValue(itemData['item_' + item].attributes, 'target_crit_multiplier', 0) / 100,
                        'count': 1,
                        'displayname': 'Soul Rend'
                    }
                }
                else {
                    sources['soul_rend'].count += 1;
                }
            }
        }
        return sources;
    };

    self.getCleaveSource = function () {
        var sources = {};
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            switch (item) {
                case 'bfury':
                    if (sources[item] == undefined) {
                        sources[item] = {
                            'radius': self.getItemAttributeValue(itemData['item_' + item].attributes, 'cleave_radius', 0),
                            'magnitude': self.getItemAttributeValue(itemData['item_' + item].attributes, 'cleave_damage_percent', 0) / 100,
                            'count': 1,
                            'displayname': itemData['item_' + item].displayname
                        }
                    }
                    else {
                        sources[item].count += 1;
                    }
                break;
            }

        }
        return sources;
    };
    
    self.getAccuracyDebuffSource = function () {
        var sources = {};
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            switch (item) {
                case 'bloodthorn':
                    if (sources[item] == undefined) {
                        sources[item] = {
                            'chance': 1,
                            'count': 1,
                            'displayname': 'Soul Rend'
                        }
                    }
                break;
                case 'solar_crest':
                    if (sources[item] == undefined) {
                        sources[item] = {
                            'chance': self.getItemAttributeValue(itemData['item_' + item].attributes, 'truestrike_chance', 0) / 100,
                            'count': 1,
                            'displayname': 'Shine'
                        }
                    }
                break;
            }

        }
        return sources;
    };
    
    self.getAccuracySource = function (attacktype) {
        var sources = {};
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            switch (item) {
                case 'javelin':
                    if (sources[item] == undefined) {
                        sources[item] = {
                            'chance': self.getItemAttributeValue(itemData['item_' + item].attributes, 'bonus_chance', 0) / 100,
                            'count': 1,
                            'displayname': itemData['item_' + item].displayname + ' Pierce'
                        }
                    }
                    else {
                        sources[item].count += 1;
                    }
                break;
                case 'monkey_king_bar':
                    if (sources[item] == undefined) {
                        sources[item] = {
                            'chance': self.getItemAttributeValue(itemData['item_' + item].attributes, 'bonus_chance', 0) / 100,
                            'count': 1,
                            'displayname': itemData['item_' + item].displayname + ' Pierce'
                        }
                    }
                break;
                case 'abyssal_blade':
                case 'basher':
                    if (!sources.hasOwnProperty('bash')) {
                        sources['bash'] = {
                            'chance': self.getItemAttributeValue(itemData['item_' + item].attributes, (attacktype == 'DOTA_UNIT_CAP_MELEE_ATTACK') ?'bash_chance_melee' : 'bash_chance_ranged', 0) / 100,
                            'count': 1,
                            'displayname': 'Bash'
                        }
                    }
                break;
            }

        }
        return sources;
    };
    
    self.getBashSource = function (attacktype) {
        var sources = {};
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            switch (item) {
                case 'abyssal_blade':
                case 'basher':
                    if (!sources.hasOwnProperty('bash')) {
                        sources['bash'] = {
                            'item': item,
                            'chance': self.getItemAttributeValue(itemData['item_' + item].attributes, (attacktype == 'DOTA_UNIT_CAP_MELEE_ATTACK') ?'bash_chance_melee' : 'bash_chance_ranged', 0) / 100,
                            'damage': self.getItemAttributeValue(itemData['item_' + item].attributes, 'bonus_chance_damage', 0),
                            'duration': self.getItemAttributeValue(itemData['item_' + item].attributes, 'bash_duration', 0),
                            'count': 1,
                            'damageType': 'physical',
                            'displayname': 'Bash' //itemData['item_' + item].displayname
                        }
                    }
                    else {
                        //sources[item].count += 1;
                    }
                break;
            }

        }
        return sources;
    };
    
    self.getOrbProcSource = function () {
        var sources = {};
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            switch (item) {
                case 'javelin':
                    if (sources[item] == undefined) {
                        sources[item] = {
                            'chance': self.getItemAttributeValue(itemData['item_' + item].attributes, 'bonus_chance', 0) / 100,
                            'damage': self.getItemAttributeValue(itemData['item_' + item].attributes, 'bonus_chance_damage', 0),
                            'damageType': 'magic',
                            'count': 1,
                            'displayname': itemData['item_' + item].displayname + ' Pierce'
                        }
                    }
                    else {
                        sources[item].count += 1;
                    }
                break;
                case 'monkey_king_bar':
                    if (sources[item] == undefined) {
                        sources[item] = {
                            'chance': self.getItemAttributeValue(itemData['item_' + item].attributes, 'bonus_chance', 0) / 100,
                            'damage': self.getItemAttributeValue(itemData['item_' + item].attributes, 'bonus_chance_damage', 0),
                            'count': 1,
                            'damageType': 'pure',
                            'displayname': itemData['item_' + item].displayname + ' Pierce'
                        }
                    }
                break;
                case 'maelstrom':
                case 'mjollnir':
                    if (sources[item] == undefined) {
                        sources[item] = {
                            'chance': self.getItemAttributeValue(itemData['item_' + item].attributes, 'chain_chance', 0) / 100,
                            'damage': self.getItemAttributeValue(itemData['item_' + item].attributes, 'chain_damage', 0),
                            'count': 1,
                            'damageType': 'magic',
                            'displayname': 'Chain Lightning'
                        }
                    }
                break;
            }

        }
        return sources;
    };

    self.getOrbSource = function () {
        var sources = {};
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            switch (item) {
                case 'diffusal_blade':
                    if (sources[item] == undefined) {
                        sources[item] = {
                            'chance': 1,
                            'damage': self.getItemAttributeValue(itemData['item_' + item].attributes, 'feedback_mana_burn', self.items()[i].size),
                            'count': 1,
                            'damageType': 'physical',
                            'displayname': itemData['item_' + item].displayname
                        }
                    }
                    else {
                        sources[item].count += 1;
                    }
                break;
            }

        }
        return sources;
    };
    
    self.getHealth = function () {
        var sources = new StatModel();
        for (var i = 0; i < self.items().length; i++) {
            var itemId = self.items()[i].item;
            if (!self.items()[i].enabled()) continue;
            var item = itemData['item_' + itemId];
            for (var j = 0; j < item.attributes.length; j++) {
                var attribute = item.attributes[j];
                switch(attribute.name) {
                    case 'bonus_health':
                        sources.add(parseInt(attribute.value[0]), item.displayname);
                    break;
                }
            }
        }
        return sources;
    };
    self.getHealthRegen = function () {
        var sources = new StatModel();
        for (var i = 0; i < self.items().length; i++) {
            var itemId = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            var item = itemData['item_' + itemId];
            for (var j = 0; j < item.attributes.length; j++) {
                var attribute = item.attributes[j];
                switch(attribute.name) {
                    case 'health_regen':
                    case 'bonus_regen':
                    case 'hp_regen':
                        sources.add(parseInt(attribute.value[0]), item.displayname);
                    break;
                    case 'bonus_health_regen':
                        if (itemId == 'tranquil_boots' && !isActive) {
                            sources.add(parseInt(attribute.value[0]), item.displayname);
                        }
                        else if (itemId != 'tranquil_boots') {
                            sources.add(parseInt(attribute.value[0]), item.displayname);
                        }
                    break;
                    case 'health_regen_rate':
                        if (itemId == 'heart' && isActive) {
                            sources.add((parseInt(attribute.value[0]) / 100) * self.hero.health().total, item.displayname);
                        }
                    break;
                }
            }
        }
        return sources;
    };
    self.getHealthRegenAura = function (sources, e) {
        var excludeList = e || [];
        sources = sources || new StatModel();
        for (var i = 0; i < self.items().length; i++) {
            var itemId = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            var item = itemData['item_' + itemId];
            for (var j = 0; j < item.attributes.length; j++) {
                var attribute = item.attributes[j];
                if (excludeList.indexOf(itemId + attribute.name) > -1) continue;
                switch(attribute.name) {
                    case 'aura_health_regen':
                    case 'hp_regen_aura':
                        sources.add(parseInt(attribute.value[0]), item.displayname);
                        excludeList.push(itemId + attribute.name);
                    break;
                }
            }
        }
        return { sources: sources, excludeList: excludeList };
    };
    
    self.getMana = function () {
        var sources = new StatModel();
        for (var i = 0; i < self.items().length; i++) {
            var itemId = self.items()[i].item;
            if (!self.items()[i].enabled()) continue;
            var item = itemData['item_' + itemId];
            for (var j = 0; j < item.attributes.length; j++) {
                var attribute = item.attributes[j];
                switch(attribute.name) {
                    case 'bonus_mana':
                        sources.add(parseInt(attribute.value[0]), item.displayname);
                    break;
                }
            }
        }
        return sources;
    };
    
    self.getManaRegen = function () {
        var sources = new StatModel();
        for (var i = 0; i < self.items().length; i++) {
            var itemId = self.items()[i].item;
            if (!self.items()[i].enabled()) continue;
            var item = itemData['item_' + itemId];
            for (var j = 0; j < item.attributes.length; j++) {
                var attribute = item.attributes[j];
                switch(attribute.name) {
                    case 'aura_mana_regen':
                    case 'mana_regen_aura':
                        sources.add(parseInt(attribute.value[0]), item.displayname);
                    break;
                    case 'mana_regen':
                        if (itemId == 'infused_raindrop') {
                            sources.add(parseInt(attribute.value[0]), item.displayname);
                        }
                    break;
                }
            }
        }
        return sources;
    };
    self.getManaRegenPercent = function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                switch(attribute.name) {
                    case 'bonus_mana_regen':
                    case 'mana_regen':
                    case 'bonus_mana_regen_pct':
                        if (item != 'infused_raindrop') totalAttribute += parseFloat(attribute.value[0]);
                    break;
                }
            }
        }
        return totalAttribute / 100;    
    };
    self.getManaRegenBloodstone = function () {
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            if (!self.items()[i].enabled()) continue;
            if (item.indexOf('bloodstone') != -1) {
                return new StatModel(parseInt(self.items()[i].size), itemData['item_' + item].displayname);
            }
        }
        return new StatModel();
    };
    
    self.getArmor = function () {
        var sources = new StatModel();
        for (var i = 0; i < self.items().length; i++) {
            var itemId = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            var item = itemData['item_' + itemId];
            for (var j = 0; j < item.attributes.length; j++) {
                var attribute = item.attributes[j];
                switch(attribute.name) {
                    case 'bonus_armor':
                        if (!isActive || (itemId != 'medallion_of_courage' && itemId != 'solar_crest')) {
                            sources.add(parseInt(attribute.value[0]), item.displayname, attribute.name);
                        };
                    break;
                    case 'unholy_bonus_armor':
                        if (isActive && itemId == 'armlet') {
                            sources.add(parseInt(attribute.value[0]), item.displayname, attribute.name);
                        };
                    break;
                }
            }
        }
        
        return sources;
    };
    
    self.getArmorAura = function (sources) {     
        sources = sources || new StatModel();
        for (var i = 0; i < self.items().length; i++) {
            var itemId = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            var item = itemData['item_' + itemId];
            for (var j = 0;j < item.attributes.length; j++) {
                var attribute = item.attributes[j];
                if (sources.components.find(function (a) { return attribute.name == a.id; })) continue;
                switch(attribute.name) {
                    // buckler
                    case 'bonus_aoe_armor':
                        if (isActive) {
                            sources.push(parseInt(attribute.value[0]), item.displayname, attribute.name);
                        }
                    break;
                    // assault
                    case 'aura_positive_armor':
                        sources.push(parseInt(attribute.value[0]), item.displayname, attribute.name);
                    break;
                    // ring_of_aquila,ring_of_basilius
                    case 'aura_bonus_armor':
                        if (isActive) {
                            sources.push(parseInt(attribute.value[0]), item.displayname, attribute.name);
                        }
                    break;
                    // vladmir
                    case 'armor_aura':
                        sources.push(parseInt(attribute.value[0]), item.displayname, attribute.name);
                    break;
                    // mekansm
                    case 'heal_bonus_armor':
                        if (isActive) {
                            sources.push(parseInt(attribute.value[0]), item.displayname, attribute.name);
                        }
                    break;
                }
            }
        }
        // remove buckler if there is a mekansm
        if (sources.components.find(function (attribute) { return attribute.id == 'heal_bonus_armor'; })) {
            sources.components = sources.components.filter(function (attribute) {
                return attribute.id !== 'bonus_aoe_armor';
            });
        }
        // remove ring_of_aquila,ring_of_basilius if there is a vladmir
        if (sources.components.find(function (attribute) { return attribute.id == 'armor_aura'; })) {
            sources.components = sources.components.filter(function (attribute) {
                return attribute.id !== 'aura_bonus_armor';
            });
        }
        
        sources.total = sources.components.reduce(function (memo, attribute) {
            return memo += attribute.value;
        }, 0);
        
        return sources;
    };
    self.getArmorReduction = function (sources) {
        sources = sources || new StatModel();
        for (var i = 0; i < self.items().length; i++) {
            var itemId = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            var item = itemData['item_' + itemId];
            for (var j = 0; j < item.attributes.length; j++) {
                var attribute = item.attributes[j];
                if (sources.components.find(function (component) { return component.id == attribute.name }) || sources.components.find(function (component) { return component.id == itemId + '_' + attribute.name })) continue;
                switch(attribute.name) {
                    case 'armor_reduction':
                        if (isActive || (itemId != 'medallion_of_courage' && itemId != 'solar_crest')) {
                            sources.push(parseInt(attribute.value[0]), item.displayname, itemId + '_' + attribute.name);
                        }
                    break;
                    case 'corruption_armor':
                        sources.push(parseInt(attribute.value[0]), item.displayname, itemId + '_' + attribute.name);
                    break;
                }
            }
        }
        
        sources.total = sources.components.reduce(function (memo, attribute) {
            return memo += attribute.value;
        }, 0);
        
        return sources;
    };
    self.getArmorReductionAura = function (sources) {
        sources = sources || new StatModel();
        for (var i = 0; i < self.items().length; i++) {
            var itemId = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            var item = itemData['item_' + itemId];
            for (var j = 0; j < item.attributes.length; j++) {
                var attribute = item.attributes[j];
                if (sources.components.find(function (component) { return component.id == attribute.name }) || sources.components.find(function (component) { return component.id == itemId + '_' + attribute.name })) continue;
                switch(attribute.name) {
                    case 'aura_negative_armor':
                        sources.push(parseInt(attribute.value[0]), item.displayname, itemId + '_' + attribute.name);
                    break;
                }
            }
        }
        
        sources.total = sources.components.reduce(function (memo, attribute) {
            return memo += attribute.value;
        }, 0);
        
        return sources;
    };
    self.getEvasion = function () {
        var totalAttribute = 1;
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                switch(attribute.name) {
                    case 'bonus_evasion':
                        if (!isActive || (item != 'solar_crest')) { totalAttribute *= (1 - parseInt(attribute.value[0]) / 100); }
                    break;
                }
            }
        }
        return totalAttribute;
    };
    self.getMovementSpeedFlat = function (e) {
        var totalAttribute = 0,
        excludeList = e || [],
        hasBoots = false,
        hasEuls = false,
        hasWindLace = false,
        hasDrums = false,
        bootItems = ['boots','phase_boots','arcane_boots','travel_boots','power_treads','tranquil_boots','guardian_greaves'];
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                if (excludeList.indexOf(attribute.name) > -1) continue;
                switch(attribute.name) {
                    case 'bonus_movement_speed':
                        if (!hasBoots && bootItems.indexOf(item) >= 0) {
                            if (item != 'tranquil_boots' || (item == 'tranquil_boots' && !isActive)) {
                                totalAttribute += parseInt(attribute.value[0]);
                                hasBoots = true;
                            }
                        }
                        //else if (!hasEuls && item == 'cyclone') {
                        else if (item == 'cyclone') {
                            totalAttribute += parseInt(attribute.value[0]);
                            hasEuls = true;
                        }
                    break;
                    case 'broken_movement_speed':
                        if (!hasBoots && bootItems.indexOf(item) >= 0) {
                            if (item == 'tranquil_boots' && isActive) {
                                totalAttribute += parseInt(attribute.value[0]);
                                hasBoots = true;
                            }
                        }
                    break;
                    case 'bonus_movement':
                        if (!hasBoots && bootItems.indexOf(item) >= 0) {
                            totalAttribute += parseInt(attribute.value[0]);
                            hasBoots = true;
                        }
                    break;
                    case 'movement_speed':
                        if (!hasWindLace && item == 'wind_lace') {
                            totalAttribute += parseInt(attribute.value[0]);
                            hasWindLace = true;
                        }
                    break;
                    case 'bonus_aura_movement_speed':
                        if (!hasDrums && item == 'ancient_janggo') {
                            totalAttribute += parseInt(attribute.value[0]);
                            hasDrums = true;
                            excludeList.push(attribute.name);
                        }
                    break;
                }
            }
        }
        return {value: totalAttribute, excludeList: excludeList};
    };
    self.getMovementSpeedPercent = function (e) {
        var totalAttribute = 0,
            excludeList = e || [],
            hasYasha = false,
            hasDrumsActive = false,
            hasPhaseActive = false,
            hasShadowBladeActive = false,
            hasButterflyActive = false,
            hasMoMActive = false,
            yashaItems = ['manta','yasha','sange_and_yasha'];
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                if (excludeList.indexOf(attribute.name) > -1) continue;
                switch(attribute.name) {
                    case 'movement_speed_percent_bonus':
                        if (!hasYasha && yashaItems.indexOf(item) >= 0) {
                            totalAttribute += parseInt(attribute.value[0]);
                            hasYasha = true;
                        }
                    break;
                    case 'phase_movement_speed':
                        if (isActive && !hasPhaseActive) {
                            totalAttribute += parseInt(attribute.value[0]);
                            hasPhaseActive = true;
                        }
                    break;
                    case 'bonus_movement_speed_pct':
                        if (isActive && !hasDrumsActive && item == 'ancient_janggo') {
                            totalAttribute += parseInt(attribute.value[0]);
                            hasDrumsActive = true;
                            excludeList.push(attribute.name);
                        }
                    break;
                    case 'windwalk_movement_speed':
                        if (isActive && !hasShadowBladeActive && (item == 'invis_sword' || item == 'silver_edge')) {
                            totalAttribute += parseInt(attribute.value[0]);
                            hasShadowBladeActive = true;
                        }
                    break;
                    case 'berserk_bonus_movement_speed':
                        if (isActive && !hasMoMActive && item == 'mask_of_madness') {
                            totalAttribute += parseInt(attribute.value[0]);
                            hasMoMActive = true;
                        }
                    break;
                    case 'bonus_movement_speed': //manta
                        if (!hasYasha && item == 'manta') {
                            totalAttribute += parseInt(attribute.value[0]);
                            hasYasha = true;
                        }
                        else if (item == 'smoke_of_deceit' && isActive) {
                            totalAttribute += parseInt(attribute.value[0]);
                        }
                    break;
                    case 'bonus_move_speed':
                        if (isActive && !hasButterflyActive && item == 'butterfly') {
                            totalAttribute += parseInt(attribute.value[0]);
                            hasButterflyActive = true;
                        }
                    break;
                }
            }
        }
        return {value: totalAttribute/100, excludeList: excludeList};
    };
    
    self.getMovementSpeedPercentReduction = function (e) {
        var totalAttribute = 0,
            excludeList = e || [];
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                if (excludeList.indexOf(attribute.name) > -1) continue;
                switch(attribute.name) {
                    case 'movespeed':
                        if (item == 'dust' && isActive) {
                            totalAttribute += parseInt(attribute.value[0]);
                        }
                    case 'blast_movement_speed':
                        if (item == 'shivas_guard' && isActive) {
                            totalAttribute += parseInt(attribute.value[0]);
                            excludeList.push(attribute.name);
                        }
                    case 'cold_movement_speed':
                        if (item == 'skadi') {
                            totalAttribute += parseInt(attribute.value[0]);
                        }
                    break;
                    case 'maim_movement_speed':
                        if (self.items()[i].debuff && self.items()[i].debuff == 'maim') {
                            totalAttribute += parseInt(attribute.value[0]);
                            excludeList.push(attribute.name);
                        }
                    break;
                }
            }
        }
        return {value: totalAttribute/100, excludeList: excludeList};
    };
    
    self.getBonusDamage = function () {
        var totalAttribute = 0;
        var sources = {};
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                switch(attribute.name) {
                    case 'bonus_damage':
                        totalAttribute += parseInt(attribute.value[0]);
                        if (sources[item] == undefined) {
                            sources[item] = {
                                'damage': parseInt(attribute.value[0]),
                                'damageType': 'physical',
                                'count':1,
                                'displayname': itemData['item_' + item].displayname
                            }                            
                        }
                        else {
                            sources[item].count += 1;
                        }
                    break;
                    case 'unholy_bonus_damage':
                        if (isActive) {
                            totalAttribute += parseInt(attribute.value[0]);
                            if (sources[item + '_active'] == undefined) {
                                sources[item + '_active'] = {
                                    'damage': parseInt(attribute.value[0]),
                                    'damageType': 'physical',
                                    'count':1,
                                    'displayname': itemData['item_' + item].displayname + ' Unholy Strength'
                                }                            
                            }
                            else {
                                sources[item].count += 1;
                            }
                        }
                    break;
                }
            }
        }
        return { sources: sources, total: totalAttribute };
    };
    self.getBonusDamagePercent = function (s) {
        s = s || {sources:{},total:0};
        var totalAttribute = s.total || 0;
        var sources = s.sources || {};
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                switch(attribute.name) {
                    case 'damage_aura':
                        if (sources[item] == undefined) {
                            totalAttribute += parseInt(attribute.value[0]) / 100;
                            sources[item] = {
                                'damage': parseInt(attribute.value[0]) / 100,
                                'damageType': 'physical',
                                'count':1,
                                'displayname': itemData['item_' + item].displayname
                            }
                        }
                        // else {
                            // sources[item].count += 1;
                        // }
                    break;
                    case 'bottle_doubledamage':
                        if (sources[item] == undefined) {
                            totalAttribute += parseInt(attribute.value[0]) / 100;
                            sources[item] = {
                                'damage': parseInt(attribute.value[0]) / 100,
                                'damageType': 'physical',
                                'count':1,
                                'displayname': itemData['item_' + item].displayname
                            }
                        }
                    break;
                }
            }
        }
        return { sources: sources, total: totalAttribute };
    };
    self.getAttackSpeed = function (e) {
        var totalAttribute = 0,
            hasPowerTreads = false,
            excludeList = e || [];
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                if (excludeList.indexOf(attribute.name) > -1) continue;
                switch(attribute.name) {
                    case 'bonus_attack_speed':
                        if (item == 'power_treads') {
                            if (!hasPowerTreads) {
                                totalAttribute += parseInt(attribute.value[0]);
                                hasPowerTreads = true;
                            }
                        }
                        else if (item == 'moon_shard') {
                            if (!isActive) {
                                totalAttribute += parseInt(attribute.value[0]);
                            }
                        }
                        else if (item == 'hurricane_pike') {
                            if (isActive) {
                                totalAttribute += parseInt(attribute.value[0]);
                            }
                        }
                        else {
                            totalAttribute += parseInt(attribute.value[0]);
                        }
                    break;
                    case 'consumed_bonus':
                        if (item == 'moon_shard' && isActive) {
                            totalAttribute += parseInt(attribute.value[0]);
                        }
                    break;
                    break;
                    case 'bonus_speed':
                        totalAttribute += parseInt(attribute.value[0]);
                    break;
                    // helm_of_the_dominator
                    case 'attack_speed':
                        totalAttribute += parseInt(attribute.value[0]);
                        excludeList.push(attribute.name);
                    break;
                    case 'unholy_bonus_attack_speed':
                        if (isActive) { totalAttribute += parseInt(attribute.value[0]); };
                    break;
                    case 'berserk_bonus_attack_speed':
                        if (isActive) { totalAttribute += parseInt(attribute.value[0]); };
                    break;
                }
            }
        }
        return {value: totalAttribute, excludeList: excludeList};
    };
    
    self.getAttackSpeedAura = function (e) {
        var totalAttribute = 0,
            excludeList = e || [];
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                if (excludeList.indexOf(item + attribute.name) > -1) continue;
                switch(attribute.name) {
                    // helm_of_the_dominator
                    case 'attack_speed_aura':
                        totalAttribute += parseInt(attribute.value[0]);
                        excludeList.push(item + attribute.name);
                    break;
                    // assault_cuirass
                    case 'aura_attack_speed':
                        if (item != 'shivas_guard') { totalAttribute += parseInt(attribute.value[0]); };
                        excludeList.push(item + attribute.name);
                    break;
                    // ancient_janggo
                    case 'bonus_attack_speed_pct':
                        if (isActive) {
                            totalAttribute += parseInt(attribute.value[0]);
                            excludeList.push(attribute.name);
                        }
                    break;
                }
            }
        }
        return {value: totalAttribute, excludeList: excludeList};
    };
    
    self.getAttackSpeedReduction = function (e) {
        var totalAttribute = 0,
            excludeList = e || [];
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                if (excludeList.indexOf(attribute.name) > -1) continue;
                switch(attribute.name) {
                    case 'aura_attack_speed':
                        if (item == 'shivas_guard') {
                            totalAttribute += parseInt(attribute.value[0]);
                            excludeList.push(attribute.name);
                        }
                    break;
                    case 'cold_attack_speed':
                        if (item == 'skadi') {
                            totalAttribute += parseInt(attribute.value[0]);
                            excludeList.push(attribute.name);
                        }
                    break;
                    case 'maim_attack_speed':
                        if (self.items()[i].debuff && self.items()[i].debuff == 'maim') {
                            totalAttribute += parseInt(attribute.value[0]);
                            excludeList.push(attribute.name);
                        }
                    break;
                }
            }
        }
        return {value: totalAttribute, excludeList: excludeList};
    };
    self.getLifesteal = function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                switch(attribute.name) {
                    case 'lifesteal_percent':
                        if (item == 'satanic') {
                            if (!isActive) { return parseInt(attribute.value[0]); };
                        }
                        else {
                            return parseInt(attribute.value[0]);
                        }
                    break;
                    case 'unholy_lifesteal_percent':
                        if (isActive) { return parseInt(attribute.value[0]); };
                    break;
                }
            }
        }
        return totalAttribute;
    };
    self.getLifestealAura = function (e) {
        var totalAttribute = 0,
            excludeList = e || [];
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                if (excludeList.indexOf(attribute.name) > -1) continue;
                switch(attribute.name) {
                    case 'vampiric_aura':
                        totalAttribute += parseInt(attribute.value[0]);
                        excludeList.push(attribute.name);
                    break;
                }
            }
        }
        return {value: totalAttribute, excludeList: excludeList};
    };
    self.getSpellAmp = ko.computed(function () {
        var sources = new StatModel();
        for (var i = 0; i < self.items().length; i++) {
            var itemId = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            var item = itemData['item_' + itemId];
            for (var j = 0; j < item.attributes.length; j++) {
                var attribute = item.attributes[j];
                switch(attribute.name) {
                    case 'spell_amp':
                        sources.add(parseInt(attribute.value[0])/100, item.displayname);
                    break;
                }
            }
        }
        return sources;
    });
    self.getCooldownReductionFlat = ko.computed(function () {
        var totalAttribute = 0;
        /*for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                switch(attribute.name) {
                    case 'bonus_night_vision':
                        if (item != 'moon_shard' || !isActive) {
                            totalAttribute += parseInt(attribute.value[0]);
                        }
                    break;
                }
            }
        }*/
        return totalAttribute;
    });
    self.getCooldownReductionPercent = function (aList) {        
        var totalAttribute = 1,
            attributeList = aList || [];
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0;j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                if (attributeList.find(function (a) { return attribute.name == a.name; })) continue;
                switch(attribute.name) {
                    // octarine_core
                    case 'bonus_cooldown':
                        attributeList.push({'name':attribute.name, 'value': parseInt(attribute.value[0])});
                    break;
                }
            }
        }
        
        totalAttribute = attributeList.reduce(function (memo, attribute) {
            return memo *= (1 - attribute.value / 100);
        }, 1);
        return {value: totalAttribute, attributes: attributeList};
    };
    self.getCooldownIncreaseFlat = ko.computed(function () {
        var totalAttribute = 0;
        return totalAttribute;
    });
    self.getCooldownIncreasePercent = function () {
        var totalAttribute = 1;
        return totalAttribute;
    };
    self.getMagicResist = function () {
        var totalAttribute = 1;
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                switch(attribute.name) {
                    case 'bonus_magical_armor':
                        totalAttribute *= (1 - parseInt(attribute.value[0]) / 100);
                    break;
                    case 'bonus_spell_resist':
                        totalAttribute *= (1 - parseInt(attribute.value[0]) / 100);
                    break;
                    case 'magic_resistance':
                        totalAttribute *= (1 - parseInt(attribute.value[0]) / 100);
                    break;
                }
            }
        }
        return totalAttribute;
    };
    self.getMagicResistReductionSelf = function () {
        var totalAttribute = 1;
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            if (isActive) {
                for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                    var attribute = itemData['item_' + item].attributes[j];
                    switch(attribute.name) {
                        case 'extra_spell_damage_percent':
                        case 'ethereal_damage_bonus':
                            return (1 - parseInt(attribute.value[0]) / 100);
                        break;
                    }
                }
            }
        }
        return totalAttribute;
    };   
    self.getMagicResistReduction = function () {
        var totalAttribute = 1;
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            if (isActive) {
                for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                    var attribute = itemData['item_' + item].attributes[j];
                    switch(attribute.name) {
                        case 'ethereal_damage_bonus':
                            if (!self.isEthereal()) totalAttribute *= (1 - parseInt(attribute.value[0]) / 100);
                        case 'resist_debuff':
                            totalAttribute *= (1 - parseInt(attribute.value[0]) / 100);
                        break;
                    }
                }
            }
        }
        return totalAttribute;
    };        

    self.getVisionRangeNight = ko.computed(function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                switch(attribute.name) {
                    case 'bonus_night_vision':
                        if (item != 'moon_shard' || !isActive) {
                            totalAttribute += parseInt(attribute.value[0]);
                        }
                    break;
                    // moon_shard
                    case 'consumed_bonus_night_vision':
                        if (item == 'moon_shard' && isActive) {
                            totalAttribute += parseInt(attribute.value[0]);
                        }
                    break;
                }
            }
        }
        return totalAttribute;
    });
    
    self.getAttackRange = function (attacktype, aList) {
        var totalAttribute = 0,
            attributeList = aList || [];
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0;j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                if (attributeList.find(function (a) { return attribute.name == a.name; })) continue;
                switch(attribute.name) {
                    // dragon_lance
                    case 'base_attack_range':
                        if (attacktype == 'DOTA_UNIT_CAP_RANGED_ATTACK') attributeList.push({'name':attribute.name, 'value': parseInt(attribute.value[0])});
                    break;
                }
            }
        }
        
        totalAttribute = attributeList.reduce(function (memo, attribute) {
            return memo += attribute.value;
        }, 0);
        return {value: totalAttribute, attributes: attributeList};
    };
    
    self.getBlindSource = function (e) {
        var totalAttribute = 0,
            sources = [],
            excludeList = e || [];
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                if (excludeList.indexOf(attribute.name) > -1) continue;
                switch(attribute.name) {
                    case 'blind_pct':
                        var value = parseInt(attribute.value[0]) / 100;
                        totalAttribute += value;
                        sources.push({
                            'value': value,
                            'displayname': itemData['item_' + item].displayname
                        });
                        excludeList.push(attribute.name);
                    break;
                }
            }
        }
        return {sources: sources, total: totalAttribute, excludeList: excludeList};
    };
    
    self.getBaseDamageReductionPct = function () {
        var totalAttribute = 1;
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                switch(attribute.name) {
                    case 'backstab_reduction':
                        if (self.items()[i].debuff && self.items()[i].debuff == 'shadow_walk') {
                            totalAttribute *= (1 + parseInt(attribute.value[0]) / 100);
                        }
                    break;
                }
            }
        }
        return totalAttribute;
    };    
    self.getBonusDamageReductionPct = function () {
        var totalAttribute = 1;
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                switch(attribute.name) {
                    case 'backstab_reduction':
                        if (self.items()[i].debuff && self.items()[i].debuff == 'shadow_walk') {
                            totalAttribute *= (1 + parseInt(attribute.value[0]) / 100);
                        }
                    break;
                }
            }
        }
        return totalAttribute;
    };
    
    self.itemOptions = ko.observableArray(itemOptionsArray.items);
    
    self.itemBuffOptions = ko.observableArray(itemBuffOptions.items);
    self.selectedItemBuff = ko.observable('assault');

    self.itemDebuffOptions = ko.observableArray(itemDebuffOptions.items);
    self.selectedItemDebuff = ko.observable('assault');
    
    return self;
};
InventoryViewModel.prototype = Object.create(BasicInventoryViewModel.prototype);
InventoryViewModel.prototype.constructor = InventoryViewModel;

module.exports = InventoryViewModel;