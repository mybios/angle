/**
 * Created by TreyTang on 2015/7/24.
 */
/// <reference path="../../appScript/constants.d.ts" />
/// <reference path="../../appScript/external/mini_es6.d.ts" />
/// <reference path="../../appScript/external/mini_node.d.ts" />
/// <reference path="../../appScript/common/ext/cc/CCExtend.d.ts" />
/// <reference path="./Cocos2d.d.ts" />
/// <reference path="../../appScript/api/js_cocos2dx_auto_api.d.ts" />
/// <reference path="../../appScript/api/js_cocos2dx_ui_auto_api.d.ts" />
/// <reference path="../../appScript/api/js_cocos2dx_gameext_auto_api.d.ts" />

/* tslint:disable */
/////////////////////////////
/// IE11 ECMAScript Extensions
/////////////////////////////

/// <reference path="../../appScript/common/config/PreLanguage.ts" />
/// <reference path="../../appScript/common/ext/node/Plugin.ts" />
///<reference path="..\..\appScript\common\tools\CustomEventManager.ts"/>


declare module Reflect
{
    export interface Type
    {
        kind : any;
    }
}

declare function print(...args:any[]): void;

declare module game
{
    export interface AnimEntity{

    }
}

declare type XMLParseResult = any;


declare module cc
{
    export class UIFromFile extends Layout
    {
        // 以节点名字为键，保存所有子节点
        Items:{[nodeName:string]:cc.Widget};
        // 返回类型为T的节点nodeName
        getItem<T extends cc.Node>(nodeName:string):T;
    }
    export interface XMLParseResult
    {
        Children : Array<XMLParseResult>;
        Attributes : {[key:string]:string};
        Name:string;
        Value:string;
    }
}
declare function loadUI(fileName:string): cc.UIFromFile;

