import { createElementBlock as m, openBlock as f, createElementVNode as h, defineComponent as D, ref as C, computed as q, reactive as Z, onUnmounted as ee, inject as X, onMounted as te, watch as ne, normalizeStyle as oe, normalizeClass as r, createVNode as z, withModifiers as P, Fragment as M, renderList as V, toDisplayString as E, createCommentVNode as Y, createBlock as se } from "vue";
const A = (v, d) => {
  const b = v.__vccOpts || v;
  for (const [T, s] of d)
    b[T] = s;
  return b;
}, le = {}, ie = {
  viewBox: "0 0 1024 1024",
  xmlns: "http://www.w3.org/2000/svg",
  width: "20",
  height: "20"
};
function ae(v, d) {
  return f(), m("svg", ie, [...d[0] || (d[0] = [
    h("path", {
      d: "M288 224c0-35.3 28.7-64 64-64s64 28.7 64 64-28.7 64-64 64-64-28.7-64-64zm320 0c0-35.3 28.7-64 64-64s64 28.7 64 64-28.7 64-64 64-64-28.7-64-64zM288 512c0-35.3 28.7-64 64-64s64 28.7 64 64-28.7 64-64 64-64-28.7-64-64zm320 0c0-35.3 28.7-64 64-64s64 28.7 64 64-28.7 64-64 64-64-28.7-64-64zM352 864c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64zm320 0c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64z",
      fill: "currentColor"
    }, null, -1)
  ])]);
}
const re = /* @__PURE__ */ A(le, [["render", ae]]), ce = {}, de = {
  viewBox: "0 0 1024 1024",
  xmlns: "http://www.w3.org/2000/svg",
  width: "20",
  height: "20"
};
function ue(v, d) {
  return f(), m("svg", de, [...d[0] || (d[0] = [
    h("path", {
      d: "M831.872 340.864 512 652.672 192.128 340.864a30.592 30.592 0 0 0-42.752 0 29.12 29.12 0 0 0 0 41.6L489.664 714.24a32 32 0 0 0 44.672 0l340.288-331.712a29.12 29.12 0 0 0 0-41.728 30.592 30.592 0 0 0-42.752 0z",
      fill: "currentColor"
    }, null, -1)
  ])]);
}
const he = /* @__PURE__ */ A(ce, [["render", ue]]), fe = ["onClick"], me = ["onClick"], ye = ["onClick"], ge = /* @__PURE__ */ D({
  __name: "AffinityNav",
  setup(v) {
    const d = C(!1), b = (e) => {
      e.stopPropagation(), d.value = !d.value;
    }, T = q(() => ({
      top: s.top + "px",
      right: s.right + "px"
    })), s = Z({
      ing: !1,
      top: 100,
      right: 20,
      startTop: 0,
      startRight: 0,
      startX: 0,
      startY: 0,
      width: 0,
      height: 0
    }), I = (e) => {
      var c;
      if (e instanceof TouchEvent && (e = e.touches[0]), !s.ing)
        return;
      let n = s.startTop + (e.clientY - s.startY), t = s.startRight - (e.clientX - s.startX);
      const o = (c = document.querySelector(".plugin-view")) == null ? void 0 : c.getBoundingClientRect();
      let l = 0, i = window.innerHeight - s.height, u = 0, a = window.innerWidth - s.width;
      o && (l = o.top, i = o.bottom - s.height, u = window.innerWidth - o.right, a = window.innerWidth - o.left - s.width), n < l && (n = l), n > i && (n = i), t < u && (t = u), t > a && (t = a), s.top = n, s.right = t;
    }, O = (e) => {
      var t;
      e instanceof TouchEvent && (e = e.touches[0]);
      const n = (t = e.target.closest(`.${J().container}`)) == null ? void 0 : t.getBoundingClientRect();
      n && (s.width = n.width, s.height = n.height), s.startTop = s.top, s.startRight = s.right, s.startX = e.clientX, s.startY = e.clientY, s.ing = !0;
    }, K = () => {
      s.ing = !1;
    };
    window.addEventListener("mousemove", I), window.addEventListener("mouseup", K), window.addEventListener("touchmove", I), window.addEventListener("touchend", K), ee(() => {
      window.removeEventListener("mousemove", I), window.removeEventListener("mouseup", K), window.removeEventListener("touchmove", I), window.removeEventListener("touchend", K), g == null || g.disconnect();
    });
    const y = X(
      "manager.settings.current"
    ), W = [
      { title: "好感度设置", key: "affinity" },
      { title: "黑名单设置", key: "blacklist" },
      { title: "关系设置", key: "relationship" },
      { title: "日程设置", key: "schedule" },
      { title: "其他变量", key: "otherVariables" },
      { title: "其他工具", key: "otherTools" },
      { title: "其他设置", key: "otherSettings" }
    ], j = q(() => {
      var n, t;
      const e = (n = y == null ? void 0 : y.value) == null ? void 0 : n.config;
      return e ? [
        { name: "调整好感度", enableKey: "registerAffinityTool", enabled: !!e.registerAffinityTool },
        { name: "管理黑名单", enableKey: "registerBlacklistTool", enabled: !!e.registerBlacklistTool },
        { name: "调整关系", enableKey: "registerRelationshipTool", enabled: !!e.registerRelationshipTool },
        { name: "获取今日日程", enableKey: "schedule.registerTool", enabled: !!((t = e.schedule) != null && t.registerTool) },
        { name: "戳一戳", enableKey: "enablePokeTool", enabled: !!e.enablePokeTool },
        { name: "修改账户信息", enableKey: "enableSetSelfProfileTool", enabled: !!e.enableSetSelfProfileTool },
        { name: "撤回消息", enableKey: "enableDeleteMessageTool", enabled: !!e.enableDeleteMessageTool }
      ] : [];
    }), F = q(() => {
      var c, p, k, S, $, L, B, R;
      const e = (c = y == null ? void 0 : y.value) == null ? void 0 : c.config;
      if (!e) return [];
      const n = e.enableAffinityAnalysis !== !1, t = ((p = e.schedule) == null ? void 0 : p.enabled) !== !1, o = e.contextAffinityOverview, l = e.userInfo || ((k = e.otherVariables) == null ? void 0 : k.userInfo), i = e.botInfo || ((S = e.otherVariables) == null ? void 0 : S.botInfo), u = e.groupInfo || (($ = e.otherVariables) == null ? void 0 : $.groupInfo), a = (L = e.otherVariables) == null ? void 0 : L.random;
      return [
        { name: e.affinityVariableName || "affinity", key: "affinity", enabled: n },
        o != null && o.variableName ? { name: o.variableName, key: "contextAffinity", enabled: n } : null,
        { name: e.relationshipVariableName || "relationship", key: "relationship", enabled: n },
        { name: ((B = e.schedule) == null ? void 0 : B.variableName) || "schedule", key: "schedule", enabled: t },
        { name: ((R = e.schedule) == null ? void 0 : R.currentVariableName) || "currentSchedule", key: "currentSchedule", enabled: t },
        { name: (l == null ? void 0 : l.variableName) || "userInfo", key: "userInfo", enabled: (l == null ? void 0 : l.enabled) !== !1 },
        { name: (i == null ? void 0 : i.variableName) || "botInfo", key: "botInfo", enabled: (i == null ? void 0 : i.enabled) !== !1 },
        { name: (u == null ? void 0 : u.variableName) || "groupInfo", key: "groupInfo", enabled: (u == null ? void 0 : u.enabled) !== !1 },
        { name: (a == null ? void 0 : a.variableName) || "random", key: "random", enabled: (a == null ? void 0 : a.enabled) !== !1 }
      ].filter((Q) => !!Q);
    }), _ = C(""), w = C(""), H = (e) => {
      _.value = e.key, w.value = "";
      const n = {
        affinity: "好感度设置",
        blacklist: "黑名单设置",
        relationship: "关系设置",
        schedule: "日程设置",
        otherVariables: "其他变量",
        otherTools: "其他工具",
        otherSettings: "其他设置"
      }, t = document.querySelectorAll(".k-schema-header");
      for (let o = 0; o < t.length; o++) {
        const l = t[o];
        if ((l.textContent || "").includes(n[e.key])) {
          l.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
      }
    }, U = (e) => {
      w.value = "tool-" + e.enableKey, _.value = "";
      const n = e.enableKey.split("."), t = n[n.length - 1], o = document.querySelectorAll(".k-schema-left");
      for (let l = 0; l < o.length; l++) {
        const i = o[l];
        if ((i.textContent || "").includes(t)) {
          if (n.length > 1) {
            const a = n[0];
            let c = i.parentElement, p = !1;
            for (; c && !p; ) {
              const k = c.textContent || "";
              k.includes(a) && k.includes(t) && (p = !0), c = c.parentElement;
            }
            if (!p) continue;
          }
          i.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
      }
    }, G = (e) => {
      var u;
      w.value = "var-" + e.key, _.value = "";
      const t = {
        affinity: { section: "好感度设置", searchKey: "affinityVariableName" },
        contextAffinity: { section: "好感度设置", searchKey: ["contextAffinityOverview", "上下文好感度设置"] },
        relationship: { section: "关系设置", searchKey: "relationshipVariableName" },
        schedule: { section: "日程设置", searchKey: "variableName" },
        currentSchedule: { section: "日程设置", searchKey: "currentVariableName" },
        userInfo: { section: "其他变量", searchKey: "userInfo" },
        botInfo: { section: "其他变量", searchKey: "botInfo" },
        groupInfo: { section: "其他变量", searchKey: "groupInfo" },
        random: { section: "其他变量", searchKey: "random" }
      }[e.key];
      if (!t) return;
      const o = document.querySelectorAll(".k-schema-header");
      let l = null;
      for (let a = 0; a < o.length; a++) {
        const c = o[a];
        if ((u = c.textContent) != null && u.includes(t.section)) {
          l = c.parentElement;
          break;
        }
      }
      if (!l) return;
      const i = l.querySelectorAll(".k-schema-left");
      for (let a = 0; a < i.length; a++) {
        const c = i[a], p = c.textContent || "";
        if ((Array.isArray(t.searchKey) ? t.searchKey : [t.searchKey]).some(($) => $ && p.includes($)) || p.includes(e.key)) {
          c.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
      }
    };
    let g = null;
    const N = /* @__PURE__ */ new Map(), x = () => {
      g && (g.disconnect(), N.clear()), g = new IntersectionObserver((t) => {
        for (const o of t)
          if (o.isIntersecting) {
            const l = N.get(o.target);
            l && (_.value = l, w.value = "");
          }
      }, { root: null, rootMargin: "-20% 0px -60% 0px", threshold: 0 });
      const e = {
        好感度设置: "affinity",
        黑名单设置: "blacklist",
        关系设置: "relationship",
        日程设置: "schedule",
        其他变量: "otherVariables",
        其他工具: "otherTools",
        其他设置: "otherSettings"
      };
      document.querySelectorAll(".k-schema-header").forEach((t) => {
        const o = t.textContent || "";
        for (const [l, i] of Object.entries(e))
          if (o.includes(l)) {
            g == null || g.observe(t), N.set(t, i);
            break;
          }
      });
    };
    te(() => {
      setTimeout(x, 500);
    }), ne(() => {
      var e;
      return (e = y == null ? void 0 : y.value) == null ? void 0 : e.config;
    }, () => {
      setTimeout(x, 500);
    }, { deep: !0 });
    const J = () => ({ container: "container" });
    return (e, n) => (f(), m("div", {
      class: r([e.$style.container, d.value ? e.$style.collapsed : ""]),
      style: oe(T.value)
    }, [
      h("div", {
        class: r(e.$style.header),
        onMousedown: O,
        onTouchstart: O
      }, [
        z(re, {
          class: r(e.$style.move)
        }, null, 8, ["class"]),
        h("div", {
          class: r(e.$style.toggle),
          onClick: b,
          onMousedown: n[0] || (n[0] = P(() => {
          }, ["stop"])),
          onTouchstart: n[1] || (n[1] = P(() => {
          }, ["stop"]))
        }, [
          z(he)
        ], 34)
      ], 34),
      h("div", {
        class: r(e.$style.body)
      }, [
        (f(), m(M, null, V(W, (t) => h("div", {
          key: t.key,
          class: r([e.$style.item, _.value === t.key ? e.$style.active : ""]),
          onClick: (o) => H(t)
        }, E(t.title), 11, fe)), 64)),
        h("div", {
          class: r(e.$style.divider)
        }, "可用工具", 2),
        (f(!0), m(M, null, V(j.value, (t) => (f(), m("div", {
          key: "tool-" + t.enableKey,
          class: r([e.$style.item, e.$style.toolItem, w.value === "tool-" + t.enableKey ? e.$style.active : ""]),
          onClick: (o) => U(t)
        }, [
          h("span", {
            class: r(e.$style.toolIndicator)
          }, [
            t.enabled ? (f(), m("span", {
              key: 0,
              class: r(e.$style.indicatorOn)
            }, null, 2)) : Y("", !0)
          ], 2),
          h("span", {
            class: r(e.$style.toolName)
          }, E(t.name), 3)
        ], 10, me))), 128)),
        h("div", {
          class: r(e.$style.divider)
        }, "可用变量", 2),
        (f(!0), m(M, null, V(F.value, (t) => (f(), m("div", {
          key: "var-" + t.key,
          class: r([e.$style.item, e.$style.toolItem, w.value === "var-" + t.key ? e.$style.active : ""]),
          onClick: (o) => G(t)
        }, [
          h("span", {
            class: r(e.$style.toolIndicator)
          }, [
            t.enabled ? (f(), m("span", {
              key: 0,
              class: r(e.$style.indicatorOn)
            }, null, 2)) : (f(), m("span", {
              key: 1,
              class: r(e.$style.indicatorOff)
            }, null, 2))
          ], 2),
          h("span", {
            class: r(e.$style.toolName)
          }, E(t.name), 3)
        ], 10, ye))), 128))
      ], 2)
    ], 6));
  }
}), pe = "_container_q7rwa_2", ve = "_header_q7rwa_21", be = "_move_q7rwa_36", we = "_toggle_q7rwa_45", ke = "_body_q7rwa_56", _e = "_collapsed_q7rwa_67", $e = "_divider_q7rwa_79", Te = "_item_q7rwa_88", Ie = "_active_q7rwa_103", Ke = "_empty_q7rwa_108", Ce = "_toolItem_q7rwa_114", Ne = "_toolIndicator_q7rwa_119", Se = "_indicatorOn_q7rwa_127", qe = "_indicatorOff_q7rwa_134", Me = "_toolName_q7rwa_141", Ve = {
  container: pe,
  header: ve,
  move: be,
  toggle: we,
  body: ke,
  collapsed: _e,
  divider: $e,
  item: Te,
  active: Ie,
  empty: Ke,
  toolItem: Ce,
  toolIndicator: Ne,
  indicatorOn: Se,
  indicatorOff: qe,
  toolName: Me
}, Ee = {
  $style: Ve
}, Ae = /* @__PURE__ */ A(ge, [["__cssModules", Ee]]), Oe = /* @__PURE__ */ D({
  __name: "AffinityDetailsLoader",
  setup(v) {
    const d = X("plugin:name"), b = C((d == null ? void 0 : d.value) === "koishi-plugin-chatluna-affinity");
    return (T, s) => b.value ? (f(), se(Ae, { key: 0 })) : Y("", !0);
  }
}), Le = (v) => {
  v.slot({
    type: "plugin-details",
    component: Oe,
    order: -999
  });
};
export {
  Le as default
};
