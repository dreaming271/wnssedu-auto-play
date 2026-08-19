// ==UserScript==
// @name         wnssedu 课程自动连播
// @namespace    scut.wnssedu
// @version      1.0.0
// @description  看课任务列表自动切章节，视频页播完自动切下一小节（挂机真播，URL直跳）
// @match        https://scut.wnssedu.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    var KEY = 'wnssedu_auto';
    var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
    var log = function () { var a = []; for (var i = 0; i < arguments.length; i++) a.push(arguments[i]); console.log.apply(console, ['[wnssedu]'].concat(a)); };

    var getState = function () { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
    var setState = function (s) { localStorage.setItem(KEY, JSON.stringify(s)); };

    var isWatch = function () { return window.location.href.indexOf('/course/newcourse/watch.htm') !== -1; };
    var isTask = function () { return window.location.href.indexOf('studytasklist.htm') !== -1; };

    // 拼 watch 网址
    function watchUrl(courseId, cw, vid) {
        return '/course/newcourse/watch.htm?courseId=' + courseId +
            '&lCoursewareId=' + cw + '&lVideoId=' + vid + '&nViewSecond=0&type=0';
    }

    // 解析目录里 showVideo(this, cw, vid, nvs, type)
    function parseShowVideo(a) {
        var oc = a ? (a.getAttribute('onclick') || '') : '';
        var m = oc.match(/showVideo\s*\([^,]*,\s*(\d+)\s*,\s*(\d+)/);
        return m ? { cw: m[1], vid: m[2] } : null;
    }

    // 解析弹窗 toCourse({...})
    function parseToCourse(td) {
        var oc = td ? (td.getAttribute('onclick') || '') : '';
        var d = oc.replace(/&quot;/g, '"');
        var cw = d.match(/"lCoursewareId"\s*:\s*"(\d+)"/);
        var vid = d.match(/"lVideoId"\s*:\s*"(\d+)"/);
        var cid = d.match(/"lCourseId"\s*:\s*"(\d+)"/);
        return (cw && vid) ? { cw: cw[1], vid: vid[1], cid: cid ? cid[1] : null } : null;
    }

    // ===== UI =====
    function buildUI() {
        if (document.getElementById('wnssedu_ui')) return;
        var box = document.createElement('div');
        box.id = 'wnssedu_ui';
        box.style.cssText =
            'position:fixed;right:14px;bottom:140px;z-index:2147483000;background:#1e293b;color:#fff;' +
            'border-radius:10px;padding:10px 12px;font:13px/1.7 "Microsoft YaHei",sans-serif;' +
            'box-shadow:0 4px 18px rgba(0,0,0,.35);';
        box.innerHTML =
            '<div style="font-weight:bold;margin-bottom:4px;">wnssedu 自动连播</div>' +
            '<div id="wnssedu_status" style="opacity:.85;margin-bottom:8px;"></div>' +
            '<button id="wnssedu_start">开始</button> ' +
            '<button id="wnssedu_stop">停止</button> ' +
            '<button id="wnssedu_reset">重置</button>' +
            '<div style="margin-top:8px;">' +
            '<input id="wnssedu_chapter" type="number" min="1" placeholder="第几章" style="width:58px;padding:2px 4px;border-radius:4px;border:none;margin-right:4px;">' +
            '<button id="wnssedu_jump">从这章开始</button>' +
            '</div>';
        document.body.appendChild(box);

        var update = function () {
            var s = getState();
            var el = document.getElementById('wnssedu_status');
            if (!el) return;
            var ch = (s.chapterIndex || 0) + 1;
            el.textContent = s.running
                ? (s.total ? '运行中 · 章节 ' + ch + '/' + s.total : '运行中 · 章节 ' + ch)
                : '已停止';
        };
        document.getElementById('wnssedu_start').onclick = function () {
            var s = getState(); s.running = true; setState(s); update(); start();
        };
        document.getElementById('wnssedu_stop').onclick = function () {
            var s = getState(); s.running = false; setState(s); update();
        };
        document.getElementById('wnssedu_reset').onclick = function () {
            var s = getState(); s.running = false; s.chapterIndex = 0; setState(s); update();
        };
        document.getElementById('wnssedu_jump').onclick = function () {
            var val = parseInt(document.getElementById('wnssedu_chapter').value, 10);
            if (!val || val < 1) return;
            var s = getState();
            s.chapterIndex = val - 1;
            s.running = true;
            setState(s);
            update();
            start();
        };
        update();
    }

    function start() {
        if (isWatch()) watchLoop();
        else if (isTask()) taskFlow();
    }

    // ===== 视频页 =====
    async function watchLoop() {
        var v = null;
        for (var i = 0; i < 600; i++) {
            var el = document.querySelector('video.pv-video');
            if (el && (el.currentSrc || el.src)) { v = el; break; }
            await sleep(500);
        }
        if (!v) { log('未找到视频'); return; }
        log('找到视频，开始播放');

        v.muted = true;
        v.play().catch(function () {});
        var keep = setInterval(function () { if (v.paused) v.play().catch(function () {}); }, 10000);

        await waitEnd(v);
        clearInterval(keep);
        await sleep(2000);
        log('本节播放结束');

        var items = Array.prototype.slice.call(document.querySelectorAll('ul.chapter_list > li')).map(function (li) {
            return {
                active: (' ' + li.className + ' ').indexOf(' active ') >= 0,
                p: parseShowVideo(li.querySelector('a'))
            };
        });
        var idx = -1;
        for (var k = 0; k < items.length; k++) { if (items[k].active) { idx = k; break; } }

        if (idx >= 0 && idx < items.length - 1) {
            var nxt = items[idx + 1].p;
            var cid = new URL(window.location.href).searchParams.get('courseId');
            if (nxt && cid) {
                log('切下一小节', nxt.cw, nxt.vid);
                window.location.href = watchUrl(cid, nxt.cw, nxt.vid);
            } else {
                log('解析下一节失败');
            }
        } else {
            var s = getState();
            s.chapterIndex = (s.chapterIndex || 0) + 1;
            setState(s);
            log('本章播完，回列表切下一章');
            window.location.href = taskUrl();
        }
    }

    function waitEnd(v) {
        return new Promise(function (resolve) {
            var done = false;
            var finish = function () { if (!done) { done = true; resolve(); } };
            var check = function () {
                if (v.ended) return true;
                var d = v.duration;
                if (d && isFinite(d) && v.currentTime >= d - 1) return true;
                return false;
            };
            var iv = setInterval(function () { if (check()) { clearInterval(iv); finish(); } }, 1000);
            v.addEventListener('ended', function () { clearInterval(iv); finish(); });
            v.addEventListener('pause', function () { if (check()) { clearInterval(iv); finish(); } });
        });
    }

    function taskUrl() {
        var s = getState();
        var lp = s.lPlanId || '4200000004';
        return 'https://scut.wnssedu.com/student/prese/studytasklist.htm?lPlanId=' + lp;
    }

    // ===== 任务列表页 =====
    async function taskFlow() {
        var s = getState();
        var lp = new URLSearchParams(window.location.search).get('lPlanId');
        if (lp) s.lPlanId = lp;

        // 等任务列表异步加载出来（最多 30 秒）
        var details = [];
        for (var i = 0; i < 60; i++) {
            details = Array.prototype.slice.call(document.querySelectorAll('#courseListUl span'))
                .filter(function (e) { return e.textContent.trim() === '查看详情'; });
            if (details.length) break;
            await sleep(500);
        }
        if (!details.length) {
            log('未找到「查看详情」，任务列表可能还没加载完，稍后重试');
            return;
        }
        s.total = details.length;
        log('任务列表已加载，共 ' + details.length + ' 章');

        var ch = s.chapterIndex || 0;
        if (ch >= details.length) {
            log('章节索引越界（chapterIndex=' + ch + '），请在面板点「重置」或用「从这章开始」重新指定');
            s.running = false;
            setState(s);
            return;
        }
        setState(s);

        log('进入章节', ch + 1, '/', details.length);
        details[ch].click();

        var opened = false;
        for (var j = 0; j < 20; j++) {
            if (document.querySelector('.layui-layer')) { opened = true; break; }
            await sleep(500);
        }
        if (!opened && details[ch].parentElement) {
            details[ch].parentElement.click();
            for (var q = 0; q < 10; q++) {
                if (document.querySelector('.layui-layer')) { opened = true; break; }
                await sleep(500);
            }
        }

        var target = null;
        for (var m = 0; m < 40; m++) {
            var tds = Array.prototype.slice.call(document.querySelectorAll('.layui-layer td'))
                .filter(function (td) { return td.textContent.trim() === '跳转'; });
            if (tds.length) {
                var p = parseToCourse(tds[0]);
                if (p) { target = p; break; }
            }
            await sleep(500);
        }
        if (!target) { log('未解析到跳转'); return; }

        log('跳转到本章第一节', target.cw, target.vid);
        window.location.href = watchUrl(target.cid, target.cw, target.vid);
    }

    // ===== 启动 =====
    log('脚本已加载：' + window.location.pathname);
    buildUI();
    if (getState().running) start();
})();
