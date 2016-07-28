define(['require','exports','module','herocalc_knockout','./herocalc_core'],function (require, exports, module) {
    'use strict';
    var ko = require('herocalc_knockout');
    
    var my = require("./herocalc_core").HEROCALCULATOR;

    my.prototype.CloneOption = function (name, displayname, levels, image, level) {
        this.heroName = ko.computed(function() {
            return (levels > 0) ? name + (level() <= levels ? level() : 1) : name;
        });
        this.heroDisplayName = displayname;
        this.image = image;
        this.levels = levels;
    };
    
    my.prototype.CloneViewModel = function (h,p) {
        var self = new my.prototype.HeroCalculatorModel(0);
        self.parent = p;
        self.selectedHero(my.prototype.findWhere(self.availableHeroes(), {heroName: 'meepo'}));
        self.hero = ko.computed(function() {
            return ko.mapping.fromJS(my.prototype.heroData['npc_dota_hero_meepo']);
        });
        return self;
    }
});