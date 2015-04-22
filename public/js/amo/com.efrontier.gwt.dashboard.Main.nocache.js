function com_efrontier_gwt_dashboard_Main() {
    var P = 'bootstrap',
        Q = 'begin',
        R = 'gwt.codesvr.com.efrontier.gwt.dashboard.Main=',
        S = 'gwt.codesvr=',
        T = 'com.efrontier.gwt.dashboard.Main',
        U = 'startup',
        V = 'DUMMY',
        W = 0,
        X = 1,
        Y = 'iframe',
        Z = 'javascript:""',
        $ = 'position:absolute; width:0; height:0; border:none; left: -1000px;',
        _ = ' top: -1000px;',
        ab = 'CSS1Compat',
        bb = '<!doctype html>',
        cb = '',
        db = '<html><head><\/head><body><\/body><\/html>',
        eb = 'undefined',
        fb = 'DOMContentLoaded',
        gb = 50,
        hb = 'Chrome',
        ib = 'eval("',
        jb = '");',
        kb = 'script',
        lb = 'javascript',
        mb = 'moduleStartup',
        nb = 'moduleRequested',
        ob = 'com_efrontier_gwt_dashboard_Main',
        pb = 'Failed to load ',
        qb = 'head',
        rb = 'meta',
        sb = 'name',
        tb = 'com.efrontier.gwt.dashboard.Main::',
        ub = '::',
        vb = 'gwt:property',
        wb = 'content',
        xb = '=',
        yb = 'gwt:onPropertyErrorFn',
        zb = 'Bad handler "',
        Ab = '" for "gwt:onPropertyErrorFn"',
        Bb = 'gwt:onLoadErrorFn',
        Cb = '" for "gwt:onLoadErrorFn"',
        Db = '#',
        Eb = '?',
        Fb = '/',
        Gb = 'img',
        Hb = 'clear.cache.gif',
        Ib = 'baseUrl',
        Jb = 'com.efrontier.gwt.dashboard.Main.nocache.js',
        Kb = 'base',
        Lb = '//',
        Mb = 'gen_ids',
        Nb = '&',
        Ob = 'false',
        Pb = 'Unexpected exception in logger detection, using empty logger: ',
        Qb = 'gxt.user.agent',
        Rb = 'chrome',
        Sb = 'opera',
        Tb = 'msie',
        Ub = 10,
        Vb = 'ie10',
        Wb = 9,
        Xb = 'ie9',
        Yb = 8,
        Zb = 'ie8',
        $b = 'msie 7',
        _b = 'ie7',
        ac = 'msie 6',
        bc = 'ie6',
        cc = 'safari',
        dc = 'version/3',
        ec = 'safari3',
        fc = 'version/4',
        gc = 'safari4',
        hc = 'safari5',
        ic = 'gecko',
        jc = 'rv:1.8',
        kc = 'gecko1_8',
        lc = 'gecko1_9',
        mc = 'adobeair',
        nc = 'air',
        oc = 2,
        pc = 3,
        qc = 4,
        rc = 5,
        sc = 6,
        tc = 7,
        uc = 'logger',
        vc = 'firebug',
        wc = 'empty',
        xc = 'user.agent',
        yc = 'webkit',
        zc = 11,
        Ac = 'user.agent.os',
        Bc = 'macintosh',
        Cc = 'mac os x',
        Dc = 'mac',
        Ec = 'linux',
        Fc = 'windows',
        Gc = 'win32',
        Hc = 'unknown',
        Ic = 'selectingPermutation',
        Jc = 'com.efrontier.gwt.dashboard.Main.devmode.js',
        Kc = '1AEC89EA17BE5B4953CF513DAFB20F5B',
        Lc = ':1',
        Mc = 'firebuglight',
        Nc = ':10',
        Oc = ':11',
        Pc = ':12',
        Qc = ':13',
        Rc = ':14',
        Sc = ':15',
        Tc = ':16',
        Uc = ':17',
        Vc = ':18',
        Wc = ':19',
        Xc = ':2',
        Yc = ':20',
        Zc = ':21',
        $c = ':22',
        _c = ':23',
        ad = 'true',
        bd = ':24',
        cd = ':25',
        dd = ':26',
        ed = ':27',
        fd = ':28',
        gd = ':29',
        hd = ':3',
        jd = ':30',
        kd = ':31',
        ld = ':32',
        md = ':33',
        nd = ':34',
        od = ':35',
        pd = ':36',
        qd = ':37',
        rd = ':38',
        sd = ':39',
        td = ':4',
        ud = ':40',
        vd = ':41',
        wd = ':42',
        xd = ':43',
        yd = ':44',
        zd = ':45',
        Ad = ':46',
        Bd = ':47',
        Cd = ':5',
        Dd = ':6',
        Ed = ':7',
        Fd = ':8',
        Gd = ':9',
        Hd = '2370ED3B7E6C148EA32DD390867C0830',
        Id = '97B4D9D9BB5BAE6F27242B259550CDAB',
        Jd = 'FBDE1DC5BB1CDB4EC087270B88420296',
        Kd = ':',
        Ld = '.cache.js',
        Md = 'link',
        Nd = 'rel',
        Od = 'stylesheet',
        Pd = 'href',
        Qd = 'loadExternalRefs',
        Rd = '/css/amo/AdobeCoralGXT.css',
        Sd = '/css/amo/tags.css',
        Td = '/css/amo/Dashboard.css',
        Ud = 'end',
        Vd = 'http:',
        Wd = 'file:',
        Xd = '_gwt_dummy_',
        Yd = '__gwtDevModeHook:com.efrontier.gwt.dashboard.Main',
        Zd = 'Ignoring non-whitelisted Dev Mode URL: ',
        $d = ':moduleBase';
    var p = window;
    var q = document;
    s(P, Q);

    function r() {
        var a = p.location.search;
        return a.indexOf(R) != -1 || a.indexOf(S) != -1
    }

    function s(a, b) {
        if(p.__gwtStatsEvent) {
            p.__gwtStatsEvent({
                moduleName: T,
                sessionId: p.__gwtStatsSessionId,
                subSystem: U,
                evtGroup: a,
                millis: (new Date).getTime(),
                type: b
            })
        }
    }
    com_efrontier_gwt_dashboard_Main.__sendStats = s;
    com_efrontier_gwt_dashboard_Main.__moduleName = T;
    com_efrontier_gwt_dashboard_Main.__errFn = null;
    com_efrontier_gwt_dashboard_Main.__moduleBase = V;
    com_efrontier_gwt_dashboard_Main.__softPermutationId = W;
    com_efrontier_gwt_dashboard_Main.__computePropValue = null;
    com_efrontier_gwt_dashboard_Main.__getPropMap = null;
    com_efrontier_gwt_dashboard_Main.__installRunAsyncCode = function() {};
    com_efrontier_gwt_dashboard_Main.__gwtStartLoadingFragment = function() {
        return null
    };
    com_efrontier_gwt_dashboard_Main.__gwt_isKnownPropertyValue = function() {
        return false
    };
    com_efrontier_gwt_dashboard_Main.__gwt_getMetaProperty = function() {
        return null
    };
    var t = null;
    var u = p.__gwt_activeModules = p.__gwt_activeModules || {};
    u[T] = {
        moduleName: T
    };
    com_efrontier_gwt_dashboard_Main.__moduleStartupDone = function(e) {
        var f = u[T].bindings;
        u[T].bindings = function() {
            var a = f ? f() : {};
            var b = e[com_efrontier_gwt_dashboard_Main.__softPermutationId];
            for(var c = W; c < b.length; c++) {
                var d = b[c];
                a[d[W]] = d[X]
            }
            return a
        }
    };
    var v;

    function w() {
        A();
        return v
    }

    function A() {
        if(v) {
            return
        }
        var a = q.createElement(Y);
        a.src = Z;
        a.id = T;
        a.style.cssText = $ + _;
        a.tabIndex = -1;
        q.body.appendChild(a);
        v = a.contentDocument;
        if(!v) {
            v = a.contentWindow.document
        }
        v.open();
        var b = document.compatMode == ab ? bb : cb;
        v.write(b + db);
        v.close()
    }

    function B(k) {
        function l(a) {
            function b() {
                if(typeof q.readyState == eb) {
                    return typeof q.body != eb && q.body != null
                }
                return /loaded|complete/.test(q.readyState)
            }
            var c = b();
            if(c) {
                a();
                return
            }

            function d() {
                if(!c) {
                    c = true;
                    a();
                    if(q.removeEventListener) {
                        q.removeEventListener(fb, d, false)
                    }
                    if(e) {
                        clearInterval(e)
                    }
                }
            }
            if(q.addEventListener) {
                q.addEventListener(fb, d, false)
            }
            var e = setInterval(function() {
                if(b()) {
                    d()
                }
            }, gb)
        }

        function m(c) {
            function d(a, b) {
                a.removeChild(b)
            }
            var e = w();
            var f = e.body;
            var g;
            if(navigator.userAgent.indexOf(hb) > -1 && window.JSON) {
                var h = e.createDocumentFragment();
                h.appendChild(e.createTextNode(ib));
                for(var i = W; i < c.length; i++) {
                    var j = window.JSON.stringify(c[i]);
                    h.appendChild(e.createTextNode(j.substring(X, j.length - X)))
                }
                h.appendChild(e.createTextNode(jb));
                g = e.createElement(kb);
                g.language = lb;
                g.appendChild(h);
                f.appendChild(g);
                d(f, g)
            } else {
                for(var i = W; i < c.length; i++) {
                    g = e.createElement(kb);
                    g.language = lb;
                    g.text = c[i];
                    f.appendChild(g);
                    d(f, g)
                }
            }
        }
        com_efrontier_gwt_dashboard_Main.onScriptDownloaded = function(a) {
            l(function() {
                m(a)
            })
        };
        s(mb, nb);
        var n = q.createElement(kb);
        n.src = k;
        if(com_efrontier_gwt_dashboard_Main.__errFn) {
            n.onerror = function() {
                com_efrontier_gwt_dashboard_Main.__errFn(ob, new Error(pb + code))
            }
        }
        q.getElementsByTagName(qb)[W].appendChild(n)
    }
    com_efrontier_gwt_dashboard_Main.__startLoadingFragment = function(a) {
        return F(a)
    };
    com_efrontier_gwt_dashboard_Main.__installRunAsyncCode = function(a) {
        var b = w();
        var c = b.body;
        var d = b.createElement(kb);
        d.language = lb;
        d.text = a;
        c.appendChild(d);
        c.removeChild(d)
    };

    function C() {
        var c = {};
        var d;
        var e;
        var f = q.getElementsByTagName(rb);
        for(var g = W, h = f.length; g < h; ++g) {
            var i = f[g],
                j = i.getAttribute(sb),
                k;
            if(j) {
                j = j.replace(tb, cb);
                if(j.indexOf(ub) >= W) {
                    continue
                }
                if(j == vb) {
                    k = i.getAttribute(wb);
                    if(k) {
                        var l, m = k.indexOf(xb);
                        if(m >= W) {
                            j = k.substring(W, m);
                            l = k.substring(m + X)
                        } else {
                            j = k;
                            l = cb
                        }
                        c[j] = l
                    }
                } else if(j == yb) {
                    k = i.getAttribute(wb);
                    if(k) {
                        try {
                            d = eval(k)
                        } catch(a) {
                            alert(zb + k + Ab)
                        }
                    }
                } else if(j == Bb) {
                    k = i.getAttribute(wb);
                    if(k) {
                        try {
                            e = eval(k)
                        } catch(a) {
                            alert(zb + k + Cb)
                        }
                    }
                }
            }
        }
        __gwt_getMetaProperty = function(a) {
            var b = c[a];
            return b == null ? null : b
        };
        t = d;
        com_efrontier_gwt_dashboard_Main.__errFn = e
    }

    function D() {
        function e(a) {
            var b = a.lastIndexOf(Db);
            if(b == -1) {
                b = a.length
            }
            var c = a.indexOf(Eb);
            if(c == -1) {
                c = a.length
            }
            var d = a.lastIndexOf(Fb, Math.min(c, b));
            return d >= W ? a.substring(W, d + X) : cb
        }

        function f(a) {
            if(a.match(/^\w+:\/\//)) {} else {
                var b = q.createElement(Gb);
                b.src = a + Hb;
                a = e(b.src)
            }
            return a
        }

        function g() {
            var a = __gwt_getMetaProperty(Ib);
            if(a != null) {
                return a
            }
            return cb
        }

        function h() {
            var a = q.getElementsByTagName(kb);
            for(var b = W; b < a.length; ++b) {
                if(a[b].src.indexOf(Jb) != -1) {
                    return e(a[b].src)
                }
            }
            return cb
        }

        function i() {
            var a = q.getElementsByTagName(Kb);
            if(a.length > W) {
                return a[a.length - X].href
            }
            return cb
        }

        function j() {
            var a = q.location;
            return a.href == a.protocol + Lb + a.host + a.pathname + a.search + a.hash
        }
        var k = g();
        if(k == cb) {
            k = h()
        }
        if(k == cb) {
            k = i()
        }
        if(k == cb && j()) {
            k = e(q.location.href)
        }
        k = f(k);
        return k
    }

    function F(a) {
        if(a.match(/^\//)) {
            return a
        }
        if(a.match(/^[a-zA-Z]+:\/\//)) {
            return a
        }
        return com_efrontier_gwt_dashboard_Main.__moduleBase + a
    }

    function G() {
        var h = [];
        var i = W;

        function j(a, b) {
            var c = h;
            for(var d = W, e = a.length - X; d < e; ++d) {
                c = c[a[d]] || (c[a[d]] = [])
            }
            c[a[e]] = b
        }
        var k = [];
        var l = [];

        function m(a) {
            var b = l[a](),
                c = k[a];
            if(b in c) {
                return b
            }
            var d = [];
            for(var e in c) {
                d[c[e]] = e
            }
            if(t) {
                t(a, d, b)
            }
            throw null
        }
        l[Mb] = function() {
            try {
                var b;
                if(b == null) {
                    var c = location.search;
                    var d = c.indexOf(Mb);
                    if(d >= W) {
                        var e = c.substring(d);
                        var f = e.indexOf(xb) + X;
                        var g = e.indexOf(Nb);
                        if(g == -1) {
                            g = e.length
                        }
                        b = e.substring(f, g)
                    }
                }
                if(b == null) {
                    return Ob
                }
                return b
            } catch(a) {
                alert(Pb + a);
                return Ob
            }
        };
        k[Mb] = {
            'false': W,
            'true': X
        };
        l[Qb] = function() {
            var a = navigator.userAgent.toLowerCase();
            if(a.indexOf(Rb) != -1) return Rb;
            if(a.indexOf(Sb) != -1) return Sb;
            if(a.indexOf(Tb) != -1) {
                if(q.documentMode >= Ub) return Vb;
                if(q.documentMode >= Wb) return Xb;
                if(q.documentMode >= Yb) return Zb;
                if(a.indexOf($b) != -1) return _b;
                if(a.indexOf(ac) != -1) return bc;
                return Vb
            }
            if(a.indexOf(cc) != -1) {
                if(a.indexOf(dc) != -1) return ec;
                if(a.indexOf(fc) != -1) return gc;
                return hc
            }
            if(a.indexOf(ic) != -1) {
                if(a.indexOf(jc) != -1) return kc;
                return lc
            }
            if(a.indexOf(mc) != -1) return nc;
            return null
        };
        k[Qb] = {
            air: W,
            chrome: X,
            gecko1_8: oc,
            gecko1_9: pc,
            ie10: qc,
            ie8: rc,
            ie9: sc,
            safari3: tc,
            safari4: Yb,
            safari5: Wb
        };
        l[uc] = function() {
            try {
                var b;
                if(window.console && window.console.firebug) {
                    b = vc
                }
                if(b == null) {
                    var c = location.search;
                    var d = c.indexOf(uc);
                    if(d >= W) {
                        var e = c.substring(d);
                        var f = e.indexOf(xb) + X;
                        var g = e.indexOf(Nb);
                        if(g == -1) {
                            g = e.length
                        }
                        b = e.substring(f, g)
                    }
                }
                if(b == null) {
                    return wc
                }
                return b
            } catch(a) {
                alert(Pb + a);
                return wc
            }
        };
        k[uc] = {
            empty: W,
            firebug: X,
            firebuglight: oc
        };
        l[xc] = function() {
            var a = navigator.userAgent.toLowerCase();
            var b = q.documentMode;
            if(function() {
                    return a.indexOf(yc) != -1
                }()) return cc;
            if(function() {
                    return a.indexOf(Tb) != -1 && (b >= Ub && b < zc)
                }()) return Vb;
            if(function() {
                    return a.indexOf(Tb) != -1 && (b >= Wb && b < zc)
                }()) return Xb;
            if(function() {
                    return a.indexOf(Tb) != -1 && (b >= Yb && b < zc)
                }()) return Zb;
            if(function() {
                    return a.indexOf(ic) != -1 || b >= zc
                }()) return kc;
            return cb
        };
        k[xc] = {
            gecko1_8: W,
            ie10: X,
            ie8: oc,
            ie9: pc,
            safari: qc
        };
        l[Ac] = function() {
            var a = p.navigator.userAgent.toLowerCase();
            if(a.indexOf(Bc) != -1 || a.indexOf(Cc) != -1) {
                return Dc
            }
            if(a.indexOf(Ec) != -1) {
                return Ec
            }
            if(a.indexOf(Fc) != -1 || a.indexOf(Gc) != -1) {
                return Fc
            }
            return Hc
        };
        k[Ac] = {
            linux: W,
            mac: X,
            unknown: oc,
            windows: pc
        };
        __gwt_isKnownPropertyValue = function(a, b) {
            return b in k[a]
        };
        com_efrontier_gwt_dashboard_Main.__getPropMap = function() {
            var a = {};
            for(var b in k) {
                if(k.hasOwnProperty(b)) {
                    a[b] = m(b)
                }
            }
            return a
        };
        com_efrontier_gwt_dashboard_Main.__computePropValue = m;
        p.__gwt_activeModules[T].bindings = com_efrontier_gwt_dashboard_Main.__getPropMap;
        s(P, Ic);
        if(r()) {
            return F(Jc)
        }
        var n;
        try {
            j([Ob, Rb, wc, cc, Ec], Kc);
            j([Ob, Rb, wc, cc, Dc], Kc + Lc);
            j([Ob, Rb, Mc, cc, Hc], Kc + Nc);
            j([Ob, Rb, Mc, cc, Fc], Kc + Oc);
            j([Ob, hc, wc, cc, Ec], Kc + Pc);
            j([Ob, hc, wc, cc, Dc], Kc + Qc);
            j([Ob, hc, wc, cc, Hc], Kc + Rc);
            j([Ob, hc, wc, cc, Fc], Kc + Sc);
            j([Ob, hc, vc, cc, Ec], Kc + Tc);
            j([Ob, hc, vc, cc, Dc], Kc + Uc);
            j([Ob, hc, vc, cc, Hc], Kc + Vc);
            j([Ob, hc, vc, cc, Fc], Kc + Wc);
            j([Ob, Rb, wc, cc, Hc], Kc + Xc);
            j([Ob, hc, Mc, cc, Ec], Kc + Yc);
            j([Ob, hc, Mc, cc, Dc], Kc + Zc);
            j([Ob, hc, Mc, cc, Hc], Kc + $c);
            j([Ob, hc, Mc, cc, Fc], Kc + _c);
            j([ad, Rb, wc, cc, Ec], Kc + bd);
            j([ad, Rb, wc, cc, Dc], Kc + cd);
            j([ad, Rb, wc, cc, Hc], Kc + dd);
            j([ad, Rb, wc, cc, Fc], Kc + ed);
            j([ad, Rb, vc, cc, Ec], Kc + fd);
            j([ad, Rb, vc, cc, Dc], Kc + gd);
            j([Ob, Rb, wc, cc, Fc], Kc + hd);
            j([ad, Rb, vc, cc, Hc], Kc + jd);
            j([ad, Rb, vc, cc, Fc], Kc + kd);
            j([ad, Rb, Mc, cc, Ec], Kc + ld);
            j([ad, Rb, Mc, cc, Dc], Kc + md);
            j([ad, Rb, Mc, cc, Hc], Kc + nd);
            j([ad, Rb, Mc, cc, Fc], Kc + od);
            j([ad, hc, wc, cc, Ec], Kc + pd);
            j([ad, hc, wc, cc, Dc], Kc + qd);
            j([ad, hc, wc, cc, Hc], Kc + rd);
            j([ad, hc, wc, cc, Fc], Kc + sd);
            j([Ob, Rb, vc, cc, Ec], Kc + td);
            j([ad, hc, vc, cc, Ec], Kc + ud);
            j([ad, hc, vc, cc, Dc], Kc + vd);
            j([ad, hc, vc, cc, Hc], Kc + wd);
            j([ad, hc, vc, cc, Fc], Kc + xd);
            j([ad, hc, Mc, cc, Ec], Kc + yd);
            j([ad, hc, Mc, cc, Dc], Kc + zd);
            j([ad, hc, Mc, cc, Hc], Kc + Ad);
            j([ad, hc, Mc, cc, Fc], Kc + Bd);
            j([Ob, Rb, vc, cc, Dc], Kc + Cd);
            j([Ob, Rb, vc, cc, Hc], Kc + Dd);
            j([Ob, Rb, vc, cc, Fc], Kc + Ed);
            j([Ob, Rb, Mc, cc, Ec], Kc + Fd);
            j([Ob, Rb, Mc, cc, Dc], Kc + Gd);
            j([Ob, Xb, wc, Xb, Ec], Hd);
            j([Ob, Xb, wc, Xb, Dc], Hd + Lc);
            j([Ob, Xb, Mc, Xb, Hc], Hd + Nc);
            j([Ob, Xb, Mc, Xb, Fc], Hd + Oc);
            j([ad, Xb, wc, Xb, Ec], Hd + Pc);
            j([ad, Xb, wc, Xb, Dc], Hd + Qc);
            j([ad, Xb, wc, Xb, Hc], Hd + Rc);
            j([ad, Xb, wc, Xb, Fc], Hd + Sc);
            j([ad, Xb, vc, Xb, Ec], Hd + Tc);
            j([ad, Xb, vc, Xb, Dc], Hd + Uc);
            j([ad, Xb, vc, Xb, Hc], Hd + Vc);
            j([ad, Xb, vc, Xb, Fc], Hd + Wc);
            j([Ob, Xb, wc, Xb, Hc], Hd + Xc);
            j([ad, Xb, Mc, Xb, Ec], Hd + Yc);
            j([ad, Xb, Mc, Xb, Dc], Hd + Zc);
            j([ad, Xb, Mc, Xb, Hc], Hd + $c);
            j([ad, Xb, Mc, Xb, Fc], Hd + _c);
            j([Ob, Xb, wc, Xb, Fc], Hd + hd);
            j([Ob, Xb, vc, Xb, Ec], Hd + td);
            j([Ob, Xb, vc, Xb, Dc], Hd + Cd);
            j([Ob, Xb, vc, Xb, Hc], Hd + Dd);
            j([Ob, Xb, vc, Xb, Fc], Hd + Ed);
            j([Ob, Xb, Mc, Xb, Ec], Hd + Fd);
            j([Ob, Xb, Mc, Xb, Dc], Hd + Gd);
            j([Ob, kc, wc, kc, Ec], Id);
            j([Ob, kc, wc, kc, Dc], Id + Lc);
            j([Ob, kc, Mc, kc, Hc], Id + Nc);
            j([Ob, kc, Mc, kc, Fc], Id + Oc);
            j([Ob, lc, wc, kc, Ec], Id + Pc);
            j([Ob, lc, wc, kc, Dc], Id + Qc);
            j([Ob, lc, wc, kc, Hc], Id + Rc);
            j([Ob, lc, wc, kc, Fc], Id + Sc);
            j([Ob, lc, vc, kc, Ec], Id + Tc);
            j([Ob, lc, vc, kc, Dc], Id + Uc);
            j([Ob, lc, vc, kc, Hc], Id + Vc);
            j([Ob, lc, vc, kc, Fc], Id + Wc);
            j([Ob, kc, wc, kc, Hc], Id + Xc);
            j([Ob, lc, Mc, kc, Ec], Id + Yc);
            j([Ob, lc, Mc, kc, Dc], Id + Zc);
            j([Ob, lc, Mc, kc, Hc], Id + $c);
            j([Ob, lc, Mc, kc, Fc], Id + _c);
            j([ad, kc, wc, kc, Ec], Id + bd);
            j([ad, kc, wc, kc, Dc], Id + cd);
            j([ad, kc, wc, kc, Hc], Id + dd);
            j([ad, kc, wc, kc, Fc], Id + ed);
            j([ad, kc, vc, kc, Ec], Id + fd);
            j([ad, kc, vc, kc, Dc], Id + gd);
            j([Ob, kc, wc, kc, Fc], Id + hd);
            j([ad, kc, vc, kc, Hc], Id + jd);
            j([ad, kc, vc, kc, Fc], Id + kd);
            j([ad, kc, Mc, kc, Ec], Id + ld);
            j([ad, kc, Mc, kc, Dc], Id + md);
            j([ad, kc, Mc, kc, Hc], Id + nd);
            j([ad, kc, Mc, kc, Fc], Id + od);
            j([ad, lc, wc, kc, Ec], Id + pd);
            j([ad, lc, wc, kc, Dc], Id + qd);
            j([ad, lc, wc, kc, Hc], Id + rd);
            j([ad, lc, wc, kc, Fc], Id + sd);
            j([Ob, kc, vc, kc, Ec], Id + td);
            j([ad, lc, vc, kc, Ec], Id + ud);
            j([ad, lc, vc, kc, Dc], Id + vd);
            j([ad, lc, vc, kc, Hc], Id + wd);
            j([ad, lc, vc, kc, Fc], Id + xd);
            j([ad, lc, Mc, kc, Ec], Id + yd);
            j([ad, lc, Mc, kc, Dc], Id + zd);
            j([ad, lc, Mc, kc, Hc], Id + Ad);
            j([ad, lc, Mc, kc, Fc], Id + Bd);
            j([Ob, kc, vc, kc, Dc], Id + Cd);
            j([Ob, kc, vc, kc, Hc], Id + Dd);
            j([Ob, kc, vc, kc, Fc], Id + Ed);
            j([Ob, kc, Mc, kc, Ec], Id + Fd);
            j([Ob, kc, Mc, kc, Dc], Id + Gd);
            j([Ob, Vb, wc, Vb, Ec], Jd);
            j([Ob, Vb, wc, Vb, Dc], Jd + Lc);
            j([Ob, Vb, Mc, Vb, Hc], Jd + Nc);
            j([Ob, Vb, Mc, Vb, Fc], Jd + Oc);
            j([ad, Vb, wc, Vb, Ec], Jd + Pc);
            j([ad, Vb, wc, Vb, Dc], Jd + Qc);
            j([ad, Vb, wc, Vb, Hc], Jd + Rc);
            j([ad, Vb, wc, Vb, Fc], Jd + Sc);
            j([ad, Vb, vc, Vb, Ec], Jd + Tc);
            j([ad, Vb, vc, Vb, Dc], Jd + Uc);
            j([ad, Vb, vc, Vb, Hc], Jd + Vc);
            j([ad, Vb, vc, Vb, Fc], Jd + Wc);
            j([Ob, Vb, wc, Vb, Hc], Jd + Xc);
            j([ad, Vb, Mc, Vb, Ec], Jd + Yc);
            j([ad, Vb, Mc, Vb, Dc], Jd + Zc);
            j([ad, Vb, Mc, Vb, Hc], Jd + $c);
            j([ad, Vb, Mc, Vb, Fc], Jd + _c);
            j([Ob, Vb, wc, Vb, Fc], Jd + hd);
            j([Ob, Vb, vc, Vb, Ec], Jd + td);
            j([Ob, Vb, vc, Vb, Dc], Jd + Cd);
            j([Ob, Vb, vc, Vb, Hc], Jd + Dd);
            j([Ob, Vb, vc, Vb, Fc], Jd + Ed);
            j([Ob, Vb, Mc, Vb, Ec], Jd + Fd);
            j([Ob, Vb, Mc, Vb, Dc], Jd + Gd);
            n = h[m(Mb)][m(Qb)][m(uc)][m(xc)][m(Ac)];
            var o = n.indexOf(Kd);
            if(o != -1) {
                i = parseInt(n.substring(o + X), Ub);
                n = n.substring(W, o)
            }
        } catch(a) {}
        com_efrontier_gwt_dashboard_Main.__softPermutationId = i;
        return F(n + Ld)
    }

    function H() {
        if(!p.__gwt_stylesLoaded) {
            p.__gwt_stylesLoaded = {}
        }

        function c(a) {
            if(!__gwt_stylesLoaded[a]) {
                var b = q.createElement(Md);
                b.setAttribute(Nd, Od);
                b.setAttribute(Pd, F(a));
                q.getElementsByTagName(qb)[W].appendChild(b);
                __gwt_stylesLoaded[a] = true
            }
        }
        s(Qd, Q);
        c(Rd);
        c(Sd);
        c(Td);
        s(Qd, Ud)
    }
    C();
    com_efrontier_gwt_dashboard_Main.__moduleBase = D();
    u[T].moduleBase = com_efrontier_gwt_dashboard_Main.__moduleBase;
    var I = G();
    if(p) {
        var J = !!(p.location.protocol == Vd || p.location.protocol == Wd);
        p.__gwt_activeModules[T].canRedirect = J;

        function K() {
            var b = Xd;
            try {
                p.sessionStorage.setItem(b, b);
                p.sessionStorage.removeItem(b);
                return true
            } catch(a) {
                return false
            }
        }
        if(J && K()) {
            var L = Yd;
            var M = p.sessionStorage[L];
            if(!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/.*$/.test(M)) {
                if(M && (window.console && console.log)) {
                    console.log(Zd + M)
                }
                M = cb
            }
            if(M && !p[L]) {
                p[L] = true;
                p[L + $d] = D();
                var N = q.createElement(kb);
                N.src = M;
                var O = q.getElementsByTagName(qb)[W];
                O.insertBefore(N, O.firstElementChild || O.children[W]);
                return false
            }
        }
    }
    H();
    s(P, Ud);
    B(I);
    return true
}
com_efrontier_gwt_dashboard_Main.succeeded = com_efrontier_gwt_dashboard_Main();