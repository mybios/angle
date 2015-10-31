/// <reference path="../../appScript/external/mini_es6.d.ts" />
/// <reference path="../../appScript/external/mini_node.d.ts" />
/// <reference path="../../appScript/external/opengl.d.ts" />

declare module cc {
    var AFTER_PRELOAD_EVENT_NAME: string;
    interface BindableInterface {
        bind(propertyName: string, callBack: cc.SimpleObserveFunction, triggleAtOnce?: boolean): number;
        bindEx(propertyName: string, callBack: cc.ObserveFunction, triggleAtOnce?: boolean): number;
    }
    interface BindableCollection {
        getSize(): number;
        bindAdd(func: cc.CollectionObserveFunction, triggleAtOnce?: boolean): number;
        bindDelete(func: cc.CollectionObserveFunction): number;
        bindCollectionEvent(addFunc: cc.CollectionObserveFunction, deleteFunc: cc.CollectionObserveFunction): void;
    }
    enum BindEventType {
        add = 0,
        update = 1,
        delete = 2,
        anyEvent = 3,
    }
    interface BindEventData {
        node?: cc.Node;
        target: any;
        name: string;
        oldValue: any;
        newValue: any;
        eventType: BindEventType;
        _bind_type: number;
    }
    type ObserveFunction = (event: BindEventData) => void;
    type SimpleObserveFunction = (value: any, name: string) => void;
    class CollectionChangeType {
        static Add: string;
        static Delete: string;
        static Update: string;
    }
    interface CollectionChangeData<K, V> {
        node?: cc.Node;
        eventName: string;
        object: any;
        key: K;
        value: V;
        oldValue: V;
        _bind_type: number;
    }
    type CollectionObserveFunction = (event: CollectionChangeData<any, any>) => void;
    function handler<T, F>(self: T, func: F): F;
    function cast<T extends cc.BaseObject>(obj: cc.BaseObject, ctor: {
        new (...args: any[]): T;
    }): T;
    function clampf(value: number, min_inclusive: number, max_inclusive: number): number;
    function vec4(_x: number, _y: number, _z: number, _w: number): vec4_table;
    function vec3(_x: number, _y: number, _z: number): vec3_table;
    function vec3Add(v1: vec3_table, v2: vec3_table): vec3_table;
    function vec3Sub(pt1: vec3_table, pt2: vec3_table): vec3_table;
    function vec3Mul(pt1: vec3_table, factor: number): vec3_table;
    function vec3GetLength(pt: vec3_table): number;
    function vec3GetDistance(startP: vec3_table, P: vec3_table): number;
    function vec3Normalize(pt: vec3_table): vec3_table;
    function p(_x: number, _y: number): vec2_table;
    function pAdd(pt1: vec2_table, pt2: vec2_table): vec2_table;
    function pEqual(pt1: vec2_table, pt2: vec2_table): boolean;
    function pSub(pt1: vec2_table, pt2: vec2_table): vec2_table;
    function pMul(pt1: vec2_table, factor: number): vec2_table;
    function pMidpoint(pt1: vec2_table, pt2: vec2_table): vec2_table;
    function pForAngle(a: number): vec2_table;
    function pGetLength(pt: vec2_table): number;
    function pNormalize(pt: vec2_table): vec2_table;
    function pCross(self: vec2_table, other: vec2_table): number;
    function pDot(self: vec2_table, other: vec2_table): number;
    function pToAngleSelf(self: vec2_table): number;
    function pGetAngle(self: vec2_table, other: vec2_table): number;
    function degreeToRadian(__ANGLE__: number): number;
    function radianToDegree(__ANGLE__: number): number;
    function pGetDirectionRadian(a: vec2_table, b: vec2_table): number;
    function pGetPositionRadian(a: vec2_table, b: vec2_table): number;
    function pGetDistance(startP: vec2_table, P: vec2_table): number;
    function pIsLineIntersect(A: vec2_table, B: vec2_table, C: vec2_table, D: vec2_table, s: number, t: number): {
        ret: boolean;
        s: number;
        t: number;
    };
    function pPerp(pt: vec2_table): vec2_table;
    function RPerp(pt: vec2_table): vec2_table;
    function pProject(pt1: vec2_table, pt2: vec2_table): vec2_table;
    function pRotate(pt1: vec2_table, pt2: vec2_table): vec2_table;
    function pUnrotate(pt1: vec2_table, pt2: vec2_table): vec2_table;
    function pLengthSQ(pt: vec2_table): number;
    function pDistanceSQ(pt1: vec2_table, pt2: vec2_table): number;
    function pGetClampPoint(pt1: vec2_table, pt2: vec2_table, pt3: vec2_table): vec2_table;
    function pFromSize(sz: size_table): vec2_table;
    function pLerp(pt1: vec2_table, pt2: vec2_table, alpha: number): vec2_table;
    function pFuzzyEqual(pt1: vec2_table, pt2: vec2_table, variance: number): boolean;
    function pRotateByAngle(pt1: vec2_table, pt2: vec2_table, angle: number): vec2_table;
    function pIsSegmentIntersect(pt1: vec2_table, pt2: vec2_table, pt3: vec2_table, pt4: vec2_table): boolean;
    function pGetIntersectPoint(pt1: vec2_table, pt2: vec2_table, pt3: vec2_table, pt4: vec2_table): vec2_table;
    function size(_width: number, _height: number): size_table;
    function rect(_x: number, _y: number, _width: number, _height: number): rect_table;
    function rectEqualToRect(rect1: rect_table, rect2: rect_table): boolean;
    function rectGetMaxX(rect: rect_table): number;
    function rectGetMidX(rect: rect_table): number;
    function rectGetMinX(rect: rect_table): number;
    function rectGetMaxY(rect: rect_table): number;
    function rectGetMidY(rect: rect_table): number;
    function rectGetMinY(rect: rect_table): number;
    function rectContainsPoint(rect: rect_table, point: vec2_table): boolean;
    function rectIntersectsRect(rect1: rect_table, rect2: rect_table): boolean;
    function rectUnion(rect1: rect_table, rect2: rect_table): rect_table;
    function rectIntersection(rect1: rect_table, rect2: rect_table): rect_table;
    function c3b(_r: number, _g: number, _b: number): color3_table;
    function c4b(_r: number, _g: number, _b: number, _a: number): color4_table;
    function c4f(_r: number, _g: number, _b: number, _a: number): color4_table;
    function vertex2F(_x: number, _y: number): vec2_table;
    function Vertex3F(_x: number, _y: number, _z: number): vec3_table;
    function tex2F(_u: number, _v: number): uv_table;
    function margin(l: number, t: number, r: number, b: number): margin_table;
    function saveImage(fileName: string): void;
}
