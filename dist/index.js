import { createElementBlock as d, openBlock as r, createElementVNode as b, defineComponent as C, Fragment as M, renderList as D, normalizeClass as a, toDisplayString as B, createCommentVNode as x, reactive as X, computed as A, onUnmounted as z, ref as L, onMounted as q, inject as P, watch as j, normalizeStyle as W, unref as O, createVNode as N, withModifiers as Y, createBlock as F } from "vue";
const S = (l, t) => {
  const n = l.__vccOpts || l;
  for (const [o, c] of t)
    n[o] = c;
  return n;
}, G = {}, U = {
  viewBox: "0 0 1024 1024",
  xmlns: "http://www.w3.org/2000/svg",
  width: "20",
  height: "20"
};
function H(l, t) {
  return r(), d("svg", U, [...t[0] || (t[0] = [
    b("path", {
      d: "M288 224c0-35.3 28.7-64 64-64s64 28.7 64 64-28.7 64-64 64-64-28.7-64-64zm320 0c0-35.3 28.7-64 64-64s64 28.7 64 64-28.7 64-64 64-64-28.7-64-64zM288 512c0-35.3 28.7-64 64-64s64 28.7 64 64-28.7 64-64 64-64-28.7-64-64zm320 0c0-35.3 28.7-64 64-64s64 28.7 64 64-28.7 64-64 64-64-28.7-64-64zM352 864c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64zm320 0c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64z",
      fill: "currentColor"
    }, null, -1)
  ])]);
}
const J = /* @__PURE__ */ S(G, [["render", H]]), Q = {}, Z = {
  viewBox: "0 0 1024 1024",
  xmlns: "http://www.w3.org/2000/svg",
  width: "20",
  height: "20"
};
function ee(l, t) {
  return r(), d("svg", Z, [...t[0] || (t[0] = [
    b("path", {
      d: "M831.872 340.864 512 652.672 192.128 340.864a30.592 30.592 0 0 0-42.752 0 29.12 29.12 0 0 0 0 41.6L489.664 714.24a32 32 0 0 0 44.672 0l340.288-331.712a29.12 29.12 0 0 0 0-41.728 30.592 30.592 0 0 0-42.752 0z",
      fill: "currentColor"
    }, null, -1)
  ])]);
}
const te = /* @__PURE__ */ S(Q, [["render", ee]]), ne = ["onClick"], oe = /* @__PURE__ */ C({
  __name: "NavSection",
  props: {
    sections: {},
    activeKey: {}
  },
  emits: ["select"],
  setup(l) {
    return (t, n) => (r(!0), d(M, null, D(l.sections, (o) => (r(), d("div", {
      key: o.key,
      class: a([t.$style.item, l.activeKey === o.key ? t.$style.active : ""]),
      onClick: (c) => t.$emit("select", o)
    }, B(o.title), 11, ne))), 128));
  }
}), se = "_item_1m2kp_1", le = "_active_1m2kp_16", ie = {
  item: se,
  active: le
}, ae = {
  $style: ie
}, ce = /* @__PURE__ */ S(oe, [["__cssModules", ae]]), re = ["onClick"], de = /* @__PURE__ */ C({
  __name: "ToolList",
  props: {
    tools: {},
    activeKey: {}
  },
  emits: ["select"],
  setup(l) {
    return (t, n) => (r(), d(M, null, [
      b("div", {
        class: a(t.$style.divider)
      }, "可用工具", 2),
      (r(!0), d(M, null, D(l.tools, (o) => (r(), d("div", {
        key: "tool-" + o.enableKey,
        class: a([t.$style.item, t.$style.toolItem, l.activeKey === "tool-" + o.enableKey ? t.$style.active : ""]),
        onClick: (c) => t.$emit("select", o)
      }, [
        b("span", {
          class: a(t.$style.toolIndicator)
        }, [
          o.enabled ? (r(), d("span", {
            key: 0,
            class: a(t.$style.indicatorOn)
          }, null, 2)) : x("", !0)
        ], 2),
        b("span", {
          class: a(t.$style.toolName)
        }, B(o.name), 3)
      ], 10, re))), 128))
    ], 64));
  }
}), ue = "_divider_o41nm_1", me = "_item_o41nm_11", he = "_active_o41nm_26", ye = "_toolItem_o41nm_32", fe = "_toolIndicator_o41nm_38", ge = "_indicatorOn_o41nm_47", ve = "_toolName_o41nm_55", be = {
  divider: ue,
  item: me,
  active: he,
  toolItem: ye,
  toolIndicator: fe,
  indicatorOn: ge,
  toolName: ve
}, _e = {
  $style: be
}, pe = /* @__PURE__ */ S(de, [["__cssModules", _e]]), ke = ["onClick"], $e = /* @__PURE__ */ C({
  __name: "VariableList",
  props: {
    variables: {},
    activeKey: {}
  },
  emits: ["select"],
  setup(l) {
    return (t, n) => (r(), d(M, null, [
      b("div", {
        class: a(t.$style.divider)
      }, "可用变量", 2),
      (r(!0), d(M, null, D(l.variables, (o) => (r(), d("div", {
        key: "var-" + o.key,
        class: a([t.$style.item, t.$style.toolItem, l.activeKey === "var-" + o.key ? t.$style.active : ""]),
        onClick: (c) => t.$emit("select", o)
      }, [
        b("span", {
          class: a(t.$style.toolIndicator)
        }, [
          o.enabled ? (r(), d("span", {
            key: 0,
            class: a(t.$style.indicatorOn)
          }, null, 2)) : (r(), d("span", {
            key: 1,
            class: a(t.$style.indicatorOff)
          }, null, 2))
        ], 2),
        b("span", {
          class: a(t.$style.toolName)
        }, B(o.name), 3)
      ], 10, ke))), 128))
    ], 64));
  }
}), we = "_divider_1m58n_1", Ie = "_item_1m58n_11", Te = "_active_1m58n_26", Se = "_toolItem_1m58n_32", Ke = "_toolIndicator_1m58n_38", Ne = "_indicatorOn_1m58n_47", Me = "_indicatorOff_1m58n_55", Ce = "_toolName_1m58n_63", Ee = {
  divider: we,
  item: Ie,
  active: Te,
  toolItem: Se,
  toolIndicator: Ke,
  indicatorOn: Ne,
  indicatorOff: Me,
  toolName: Ce
}, Ve = {
  $style: Ee
}, Ae = /* @__PURE__ */ S($e, [["__cssModules", Ve]]);
function Oe(l = 100, t = 20) {
  const n = X({
    isDragging: !1,
    top: l,
    right: t,
    startTop: 0,
    startRight: 0,
    startX: 0,
    startY: 0,
    width: 0,
    height: 0
  }), o = A(() => ({
    top: n.top + "px",
    right: n.right + "px"
  })), c = (i) => {
    if (!n.isDragging) return;
    const g = i instanceof TouchEvent ? i.touches[0].clientX : i.clientX, _ = i instanceof TouchEvent ? i.touches[0].clientY : i.clientY;
    let u = n.startTop + (_ - n.startY), I = n.startRight - (g - n.startX);
    const y = document.querySelector(".plugin-view")?.getBoundingClientRect();
    let $ = 0, E = window.innerHeight - n.height, V = 0, e = window.innerWidth - n.width;
    y && ($ = y.top, E = y.bottom - n.height, V = window.innerWidth - y.right, e = window.innerWidth - y.left - n.width), n.top = Math.max($, Math.min(E, u)), n.right = Math.max(V, Math.min(e, I));
  }, w = (i, g) => {
    const _ = i instanceof TouchEvent ? i.touches[0].clientX : i.clientX, u = i instanceof TouchEvent ? i.touches[0].clientY : i.clientY, $ = i.target.closest(`.${g}`)?.getBoundingClientRect();
    $ && (n.width = $.width, n.height = $.height), n.startTop = n.top, n.startRight = n.right, n.startX = _, n.startY = u, n.isDragging = !0;
  }, h = () => {
    n.isDragging = !1;
  };
  return window.addEventListener("mousemove", c), window.addEventListener("mouseup", h), window.addEventListener("touchmove", c), window.addEventListener("touchend", h), z(() => {
    window.removeEventListener("mousemove", c), window.removeEventListener("mouseup", h), window.removeEventListener("touchmove", c), window.removeEventListener("touchend", h);
  }), {
    state: n,
    position: o,
    startDrag: w,
    endDrag: h
  };
}
function Le(l, t = {}) {
  const n = L("");
  let o = null;
  const c = /* @__PURE__ */ new Map(), w = () => {
    o && (o.disconnect(), c.clear()), o = new IntersectionObserver(
      (g) => {
        for (const _ of g)
          if (_.isIntersecting) {
            const u = c.get(_.target);
            u && (n.value = u);
          }
      },
      {
        root: null,
        rootMargin: t.rootMargin || "-20% 0px -60% 0px",
        threshold: t.threshold || 0
      }
    ), document.querySelectorAll(".k-schema-header").forEach((g) => {
      const _ = g.textContent || "";
      for (const [u, I] of Object.entries(l))
        if (_.includes(u)) {
          o?.observe(g), c.set(g, I);
          break;
        }
    });
  }, h = () => {
    setTimeout(w, 500);
  };
  return q(() => {
    h();
  }), z(() => {
    o?.disconnect();
  }), {
    activeSection: n,
    refresh: h
  };
}
const De = [
  { title: "好感度设置", key: "affinity" },
  { title: "黑名单设置", key: "blacklist" },
  { title: "关系设置", key: "relationship" },
  { title: "日程设置", key: "schedule" },
  { title: "其他变量", key: "otherVariables" },
  { title: "其他工具", key: "otherTools" },
  { title: "其他指令", key: "otherCommands" },
  { title: "其他设置", key: "otherSettings" }
], Be = {
  好感度设置: "affinity",
  黑名单设置: "blacklist",
  关系设置: "relationship",
  日程设置: "schedule",
  其他变量: "otherVariables",
  其他工具: "otherTools",
  其他指令: "otherCommands",
  其他设置: "otherSettings"
}, Re = {
  affinity: "好感度设置",
  blacklist: "黑名单设置",
  relationship: "关系设置",
  schedule: "日程设置",
  otherVariables: "其他变量",
  otherTools: "其他工具",
  otherCommands: "其他指令",
  otherSettings: "其他设置"
}, Ye = {
  affinity: { section: "好感度设置", searchKey: "affinityVariableName" },
  contextAffinity: { section: "好感度设置", searchKey: ["contextAffinityOverview", "上下文好感度变量"] },
  relationship: { section: "关系设置", searchKey: "relationshipVariableName" },
  schedule: { section: "日程设置", searchKey: "variableName" },
  currentSchedule: { section: "日程设置", searchKey: "currentVariableName" },
  userInfo: { section: "其他变量", searchKey: "userInfo" },
  botInfo: { section: "其他变量", searchKey: "botInfo" },
  groupInfo: { section: "其他变量", searchKey: "groupInfo" },
  random: { section: "其他变量", searchKey: "random" }
}, xe = "koishi-plugin-chatluna-affinity", ze = /* @__PURE__ */ C({
  __name: "AffinityNav",
  setup(l) {
    const t = L(!1), n = (e) => {
      e.stopPropagation(), t.value = !t.value;
    }, { position: o, startDrag: c } = Oe(100, 20), w = (e) => {
      c(e, "container");
    }, h = P("manager.settings.current"), i = De, g = A(() => {
      const e = h?.value?.config;
      return e ? [
        { name: "调整好感度", enableKey: "registerAffinityTool", enabled: !!e.registerAffinityTool },
        { name: "管理黑名单", enableKey: "registerBlacklistTool", enabled: !!e.registerBlacklistTool },
        { name: "调整关系", enableKey: "registerRelationshipTool", enabled: !!e.registerRelationshipTool },
        { name: "获取今日日程", enableKey: "schedule.registerTool", enabled: !!e.schedule?.registerTool },
        { name: "戳一戳", enableKey: "enablePokeTool", enabled: !!e.enablePokeTool },
        { name: "修改账户信息", enableKey: "enableSetSelfProfileTool", enabled: !!e.enableSetSelfProfileTool },
        { name: "撤回消息", enableKey: "enableDeleteMessageTool", enabled: !!e.enableDeleteMessageTool },
        { name: "网盘搜索", enableKey: "panSouTool.enablePanSouTool", enabled: !!e.panSouTool?.enablePanSouTool }
      ] : [];
    }), _ = A(() => {
      const e = h?.value?.config;
      if (!e) return [];
      const s = e.enableAffinityAnalysis !== !1, v = e.schedule?.enabled !== !1, f = e.contextAffinityOverview, p = e.userInfo || e.otherVariables?.userInfo, m = e.botInfo || e.otherVariables?.botInfo, k = e.groupInfo || e.otherVariables?.groupInfo, T = e.otherVariables?.random;
      return [
        { name: e.affinityVariableName || "affinity", key: "affinity", enabled: s },
        f?.variableName ? { name: f.variableName, key: "contextAffinity", enabled: s } : null,
        { name: e.relationshipVariableName || "relationship", key: "relationship", enabled: s },
        { name: e.schedule?.variableName || "schedule", key: "schedule", enabled: v },
        { name: e.schedule?.currentVariableName || "currentSchedule", key: "currentSchedule", enabled: v },
        { name: p?.variableName || "userInfo", key: "userInfo", enabled: p?.enabled !== !1 },
        { name: m?.variableName || "botInfo", key: "botInfo", enabled: m?.enabled !== !1 },
        { name: k?.variableName || "groupInfo", key: "groupInfo", enabled: k?.enabled !== !1 },
        { name: T?.variableName || "random", key: "random", enabled: T?.enabled !== !1 }
      ].filter((K) => !!K);
    }), { activeSection: u, refresh: I } = Le(Be), y = L(""), $ = (e) => {
      u.value = e.key, y.value = "";
      const s = document.querySelectorAll(".k-schema-header");
      for (let v = 0; v < s.length; v++) {
        const f = s[v];
        if ((f.textContent || "").includes(Re[e.key])) {
          f.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
      }
    }, E = (e) => {
      y.value = "tool-" + e.enableKey, u.value = "";
      const s = e.enableKey.split("."), v = s.length > 1 ? [s.join("."), s[s.length - 1], s[0]].filter(Boolean) : [e.enableKey], f = document.querySelectorAll(".k-schema-left");
      for (let p = 0; p < f.length; p++) {
        const m = f[p], k = m.textContent || "";
        if (v.some((K) => K && k.includes(K))) {
          m.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
      }
    }, V = (e) => {
      y.value = "var-" + e.key, u.value = "";
      const s = Ye[e.key];
      if (!s) return;
      const v = document.querySelectorAll(".k-schema-header");
      let f = null;
      for (let m = 0; m < v.length; m++) {
        const k = v[m];
        if (k.textContent?.includes(s.section)) {
          f = k.parentElement;
          break;
        }
      }
      if (!f) return;
      const p = f.querySelectorAll(".k-schema-left");
      for (let m = 0; m < p.length; m++) {
        const k = p[m], T = k.textContent || "";
        if ((Array.isArray(s.searchKey) ? s.searchKey : [s.searchKey]).some((R) => R && T.includes(R)) || T.includes(e.key)) {
          k.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
      }
    };
    return j(() => h?.value?.config, () => {
      I();
    }, { deep: !0 }), (e, s) => (r(), d("div", {
      class: a([e.$style.container, t.value ? e.$style.collapsed : ""]),
      style: W(O(o))
    }, [
      b("div", {
        class: a(e.$style.header),
        onMousedown: w,
        onTouchstart: w
      }, [
        N(J, {
          class: a(e.$style.move)
        }, null, 8, ["class"]),
        b("div", {
          class: a(e.$style.toggle),
          onClick: n,
          onMousedown: s[0] || (s[0] = Y(() => {
          }, ["stop"])),
          onTouchstart: s[1] || (s[1] = Y(() => {
          }, ["stop"]))
        }, [
          N(te)
        ], 34)
      ], 34),
      b("div", {
        class: a(e.$style.body)
      }, [
        N(ce, {
          sections: O(i),
          "active-key": O(u),
          onSelect: $
        }, null, 8, ["sections", "active-key"]),
        N(pe, {
          tools: g.value,
          "active-key": y.value,
          onSelect: E
        }, null, 8, ["tools", "active-key"]),
        N(Ae, {
          variables: _.value,
          "active-key": y.value,
          onSelect: V
        }, null, 8, ["variables", "active-key"])
      ], 2)
    ], 6));
  }
}), Pe = "_container_pbgsl_2", Xe = "_header_pbgsl_21", qe = "_move_pbgsl_36", je = "_toggle_pbgsl_45", We = "_body_pbgsl_56", Fe = "_collapsed_pbgsl_67", Ge = {
  container: Pe,
  header: Xe,
  move: qe,
  toggle: je,
  body: We,
  collapsed: Fe
}, Ue = {
  $style: Ge
}, He = /* @__PURE__ */ S(ze, [["__cssModules", Ue]]), Je = /* @__PURE__ */ C({
  __name: "AffinityDetailsLoader",
  setup(l) {
    const t = P("plugin:name"), n = A(() => t?.value === xe);
    return (o, c) => n.value ? (r(), F(He, { key: 0 })) : x("", !0);
  }
}), et = (l) => {
  l.slot({
    type: "plugin-details",
    component: Je,
    order: -999
  });
};
export {
  et as default
};
