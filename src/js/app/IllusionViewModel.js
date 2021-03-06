'use strict';
var ko = require('./herocalc_knockout');
    
var HeroCalc = require("../herocalc/main");
var illusionData = require("../herocalc/illusion/illusionData");
var heroData = require("../herocalc/data/main").heroData;
var itemData = require("../herocalc/data/main").itemData;
var findWhere = require("../herocalc/util/findWhere");

var IllusionViewModel = function (heroData, itemData, h, p, abilityLevel) {
    var self = this;
    self.parent = p;
    self.illusionType = ko.observable(self.parent.selectedIllusion().illusionName);
    if (!illusionData[self.illusionType()].use_selected_hero) {
        HeroCalc.IllusionModel.call(this, heroData, itemData, self.parent.selectedIllusion().baseHero, p, abilityLevel);
        self.selectedHero = ko.observable(findWhere(self.parent.availableHeroes(), {heroName: self.parent.selectedIllusion().baseHero}));
    }
    else {
        HeroCalc.IllusionModel.call(this, heroData, itemData, self.parent.selectedHero().heroName, p, abilityLevel);
        self.selectedHero = ko.observable(self.parent.selectedHero());
    }
    
    self.inventory = self.parent.inventory;
    self.illusionDisplayName = ko.observable(self.parent.selectedIllusion().illusionDisplayName);
    self.illusionAbilityMaxLevel = ko.observable(illusionData[self.parent.selectedIllusion().illusionName].max_level);
    /*if (!illusionData[self.illusionType()].use_selected_hero) {
        self.selectedHero(findWhere(self.parent.availableHeroes(), {heroName: self.parent.selectedIllusion().baseHero}));
    }
    else {
        self.selectedHero(self.parent.selectedHero());
    }*/
    self.selectedHeroLevel(self.parent.selectedHeroLevel());
    /*self.hero = ko.computed(function() {
        return ko.wrap.fromJS(heroData['npc_dota_hero_' + self.selectedHero().heroName]);
    });*/
    
    self.ability().getAttributeBonusLevel = self.parent.ability().getAttributeBonusLevel;
    
    self.sectionDisplay = ko.observable({
        'inventory': ko.observable(true),
        'ability': ko.observable(true),
        'buff': ko.observable(true),
        'debuff': ko.observable(true),
        'damageamp': ko.observable(false),
        'illusion': ko.observable(false),
        'skillbuild': ko.observable(false),
        'skillbuild-skills': ko.observable(true),
        'skillbuild-items': ko.observable(true)
    });
    self.sectionDisplayToggle = function (section) {
        self.sectionDisplay()[section](!self.sectionDisplay()[section]());
    }
    self.showUnitTab = ko.observable(false);
    self.showDiff = ko.observable(false);
    self.showCriticalStrikeDetails = ko.observable(false);
    self.showDamageDetails = ko.observable(false);
    self.showStatDetails = ko.observable(false);
    return self;
}
IllusionViewModel.prototype = Object.create(HeroCalc.IllusionModel.prototype);
IllusionViewModel.prototype.constructor = IllusionViewModel;

module.exports = IllusionViewModel;