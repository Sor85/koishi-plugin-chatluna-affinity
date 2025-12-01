import { createElementBlock as f, openBlock as m, createElementVNode as h, defineComponent as D, ref as K, computed as q, reactive as Z, onUnmounted as ee, inject as X, onMounted as te, watch as ne, normalizeStyle as oe, normalizeClass as r, createVNode as P, withModifiers as x, Fragment as M, renderList as V, toDisplayString as A, createCommentVNode as Y, createBlock as se } from "vue";
const E = (v, c) => {
  const b = v.__vccOpts || v;
  for (const [T, s] of c)
    b[T] = s;
  return b;
}, le = {}, ae = {
  viewBox: "0 0 1024 1024",
  xmlns: "http://www.w3.org/2000/svg",
  width: "20",
  height: "20"
};
function ie(v, c) {
  return m(), f("svg", ae, [...c[0] || (c[0] = [
    h("path", {
      d: "M288 224c0-35.3 28.7-64 64-64s64 28.7 64 64-28.7 64-64 64-64-28.7-64-64zm320 0c0-35.3 28.7-64 64-64s64 28.7 64 64-28.7 64-64 64-64-28.7-64-64zM288 512c0-35.3 28.7-64 64-64s64 28.7 64 64-28.7 64-64 64-64-28.7-64-64zm320 0c0-35.3 28.7-64 64-64s64 28.7 64 64-28.7 64-64 64-64-28.7-64-64zM352 864c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64zm320 0c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64z",
      fill: "currentColor"
    }, null, -1)
  ])]);
}
const re = /* @__PURE__ */ E(le, [["render", ie]]), ce = {}, de = {
  viewBox: "0 0 1024 1024",
  xmlns: "http://www.w3.org/2000/svg",
  width: "20",
  height: "20"
};
function ue(v, c) {
  return m(), f("svg", de, [...c[0] || (c[0] = [
    h("path", {
      d: "M831.872 340.864 512 652.672 192.128 340.864a30.592 30.592 0 0 0-42.752 0 29.12 29.12 0 0 0 0 41.6L489.664 714.24a32 32 0 0 0 44.672 0l340.288-331.712a29.12 29.12 0 0 0 0-41.728 30.592 30.592 0 0 0-42.752 0z",
      fill: "currentColor"
    }, null, -1)
  ])]);
}
const he = /* @__PURE__ */ E(ce, [["render", ue]]), me = ["onClick"], fe = ["onClick"], ye = ["onClick"], ge = /* @__PURE__ */ D({
  __name: "AffinityNav",
  setup(v) {
    const c = K(!1), b = (e) => {
      e.stopPropagation(), c.value = !c.value;
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
    }), $ = (e) => {
      var u;
      if (e instanceof TouchEvent && (e = e.touches[0]), !s.ing)
        return;
      let n = s.startTop + (e.clientY - s.startY), t = s.startRight - (e.clientX - s.startX);
      const o = (u = document.querySelector(".plugin-view")) == null ? void 0 : u.getBoundingClientRect();
      let l = 0, a = window.innerHeight - s.height, d = 0, i = window.innerWidth - s.width;
      o && (l = o.top, a = o.bottom - s.height, d = window.innerWidth - o.right, i = window.innerWidth - o.left - s.width), n < l && (n = l), n > a && (n = a), t < d && (t = d), t > i && (t = i), s.top = n, s.right = t;
    }, O = (e) => {
      var t;
      e instanceof TouchEvent && (e = e.touches[0]);
      const n = (t = e.target.closest(`.${J().container}`)) == null ? void 0 : t.getBoundingClientRect();
      n && (s.width = n.width, s.height = n.height), s.startTop = s.top, s.startRight = s.right, s.startX = e.clientX, s.startY = e.clientY, s.ing = !0;
    }, I = () => {
      s.ing = !1;
    };
    window.addEventListener("mousemove", $), window.addEventListener("mouseup", I), window.addEventListener("touchmove", $), window.addEventListener("touchend", I), ee(() => {
      window.removeEventListener("mousemove", $), window.removeEventListener("mouseup", I), window.removeEventListener("touchmove", $), window.removeEventListener("touchend", I), g == null || g.disconnect();
    });
    const y = X(
      "manager.settings.current"
    ), j = [
      { title: "好感度设置", key: "affinity" },
      { title: "黑名单设置", key: "blacklist" },
      { title: "关系设置", key: "relationship" },
      { title: "日程设置", key: "schedule" },
      { title: "其他变量", key: "otherVariables" },
      { title: "其他工具", key: "otherTools" },
      { title: "其他指令", key: "otherCommands" },
      { title: "其他设置", key: "otherSettings" }
    ], W = q(() => {
      var n, t, o;
      const e = (n = y == null ? void 0 : y.value) == null ? void 0 : n.config;
      return e ? [
        { name: "调整好感度", enableKey: "registerAffinityTool", enabled: !!e.registerAffinityTool },
        { name: "管理黑名单", enableKey: "registerBlacklistTool", enabled: !!e.registerBlacklistTool },
        { name: "调整关系", enableKey: "registerRelationshipTool", enabled: !!e.registerRelationshipTool },
        { name: "获取今日日程", enableKey: "schedule.registerTool", enabled: !!((t = e.schedule) != null && t.registerTool) },
        { name: "戳一戳", enableKey: "enablePokeTool", enabled: !!e.enablePokeTool },
        { name: "修改账户信息", enableKey: "enableSetSelfProfileTool", enabled: !!e.enableSetSelfProfileTool },
        { name: "撤回消息", enableKey: "enableDeleteMessageTool", enabled: !!e.enableDeleteMessageTool },
        { name: "网盘搜索", enableKey: "panSouTool.enablePanSouTool", enabled: !!((o = e.panSouTool) != null && o.enablePanSouTool) }
      ] : [];
    }), F = q(() => {
      var u, k, S, N, _, L, R, z;
      const e = (u = y == null ? void 0 : y.value) == null ? void 0 : u.config;
      if (!e) return [];
      const n = e.enableAffinityAnalysis !== !1, t = ((k = e.schedule) == null ? void 0 : k.enabled) !== !1, o = e.contextAffinityOverview, l = e.userInfo || ((S = e.otherVariables) == null ? void 0 : S.userInfo), a = e.botInfo || ((N = e.otherVariables) == null ? void 0 : N.botInfo), d = e.groupInfo || ((_ = e.otherVariables) == null ? void 0 : _.groupInfo), i = (L = e.otherVariables) == null ? void 0 : L.random;
      return [
        { name: e.affinityVariableName || "affinity", key: "affinity", enabled: n },
        o != null && o.variableName ? { name: o.variableName, key: "contextAffinity", enabled: n } : null,
        { name: e.relationshipVariableName || "relationship", key: "relationship", enabled: n },
        { name: ((R = e.schedule) == null ? void 0 : R.variableName) || "schedule", key: "schedule", enabled: t },
        { name: ((z = e.schedule) == null ? void 0 : z.currentVariableName) || "currentSchedule", key: "currentSchedule", enabled: t },
        { name: (l == null ? void 0 : l.variableName) || "userInfo", key: "userInfo", enabled: (l == null ? void 0 : l.enabled) !== !1 },
        { name: (a == null ? void 0 : a.variableName) || "botInfo", key: "botInfo", enabled: (a == null ? void 0 : a.enabled) !== !1 },
        { name: (d == null ? void 0 : d.variableName) || "groupInfo", key: "groupInfo", enabled: (d == null ? void 0 : d.enabled) !== !1 },
        { name: (i == null ? void 0 : i.variableName) || "random", key: "random", enabled: (i == null ? void 0 : i.enabled) !== !1 }
      ].filter((Q) => !!Q);
    }), w = K(""), p = K(""), H = (e) => {
      w.value = e.key, p.value = "";
      const n = {
        affinity: "好感度设置",
        blacklist: "黑名单设置",
        relationship: "关系设置",
        schedule: "日程设置",
        otherVariables: "其他变量",
        otherTools: "其他工具",
        otherCommands: "其他指令",
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
      p.value = "tool-" + e.enableKey, w.value = "";
      const n = e.enableKey.split("."), t = n.length > 1 ? [n.join("."), n[n.length - 1], n[0]].filter(Boolean) : [e.enableKey], o = document.querySelectorAll(".k-schema-left");
      for (let l = 0; l < o.length; l++) {
        const a = o[l], d = a.textContent || "";
        if (t.some((u) => u && d.includes(u))) {
          a.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
      }
    }, G = (e) => {
      var d;
      p.value = "var-" + e.key, w.value = "";
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
      for (let i = 0; i < o.length; i++) {
        const u = o[i];
        if ((d = u.textContent) != null && d.includes(t.section)) {
          l = u.parentElement;
          break;
        }
      }
      if (!l) return;
      const a = l.querySelectorAll(".k-schema-left");
      for (let i = 0; i < a.length; i++) {
        const u = a[i], k = u.textContent || "";
        if ((Array.isArray(t.searchKey) ? t.searchKey : [t.searchKey]).some((_) => _ && k.includes(_)) || k.includes(e.key)) {
          u.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
      }
    };
    let g = null;
    const C = /* @__PURE__ */ new Map(), B = () => {
      g && (g.disconnect(), C.clear()), g = new IntersectionObserver((t) => {
        for (const o of t)
          if (o.isIntersecting) {
            const l = C.get(o.target);
            l && (w.value = l, p.value = "");
          }
      }, { root: null, rootMargin: "-20% 0px -60% 0px", threshold: 0 });
      const e = {
        好感度设置: "affinity",
        黑名单设置: "blacklist",
        关系设置: "relationship",
        日程设置: "schedule",
        其他变量: "otherVariables",
        其他工具: "otherTools",
        其他指令: "otherCommands",
        其他设置: "otherSettings"
      };
      document.querySelectorAll(".k-schema-header").forEach((t) => {
        const o = t.textContent || "";
        for (const [l, a] of Object.entries(e))
          if (o.includes(l)) {
            g == null || g.observe(t), C.set(t, a);
            break;
          }
      });
    };
    te(() => {
      setTimeout(B, 500);
    }), ne(() => {
      var e;
      return (e = y == null ? void 0 : y.value) == null ? void 0 : e.config;
    }, () => {
      setTimeout(B, 500);
    }, { deep: !0 });
    const J = () => ({ container: "container" });
    return (e, n) => (m(), f("div", {
      class: r([e.$style.container, c.value ? e.$style.collapsed : ""]),
      style: oe(T.value)
    }, [
      h("div", {
        class: r(e.$style.header),
        onMousedown: O,
        onTouchstart: O
      }, [
        P(re, {
          class: r(e.$style.move)
        }, null, 8, ["class"]),
        h("div", {
          class: r(e.$style.toggle),
          onClick: b,
          onMousedown: n[0] || (n[0] = x(() => {
          }, ["stop"])),
          onTouchstart: n[1] || (n[1] = x(() => {
          }, ["stop"]))
        }, [
          P(he)
        ], 34)
      ], 34),
      h("div", {
        class: r(e.$style.body)
      }, [
        (m(), f(M, null, V(j, (t) => h("div", {
          key: t.key,
          class: r([e.$style.item, w.value === t.key ? e.$style.active : ""]),
          onClick: (o) => H(t)
        }, A(t.title), 11, me)), 64)),
        h("div", {
          class: r(e.$style.divider)
        }, "可用工具", 2),
        (m(!0), f(M, null, V(W.value, (t) => (m(), f("div", {
          key: "tool-" + t.enableKey,
          class: r([e.$style.item, e.$style.toolItem, p.value === "tool-" + t.enableKey ? e.$style.active : ""]),
          onClick: (o) => U(t)
        }, [
          h("span", {
            class: r(e.$style.toolIndicator)
          }, [
            t.enabled ? (m(), f("span", {
              key: 0,
              class: r(e.$style.indicatorOn)
            }, null, 2)) : Y("", !0)
          ], 2),
          h("span", {
            class: r(e.$style.toolName)
          }, A(t.name), 3)
        ], 10, fe))), 128)),
        h("div", {
          class: r(e.$style.divider)
        }, "可用变量", 2),
        (m(!0), f(M, null, V(F.value, (t) => (m(), f("div", {
          key: "var-" + t.key,
          class: r([e.$style.item, e.$style.toolItem, p.value === "var-" + t.key ? e.$style.active : ""]),
          onClick: (o) => G(t)
        }, [
          h("span", {
            class: r(e.$style.toolIndicator)
          }, [
            t.enabled ? (m(), f("span", {
              key: 0,
              class: r(e.$style.indicatorOn)
            }, null, 2)) : (m(), f("span", {
              key: 1,
              class: r(e.$style.indicatorOff)
            }, null, 2))
          ], 2),
          h("span", {
            class: r(e.$style.toolName)
          }, A(t.name), 3)
        ], 10, ye))), 128))
      ], 2)
    ], 6));
  }
}), ve = "_container_q7rwa_2", be = "_header_q7rwa_21", pe = "_move_q7rwa_36", we = "_toggle_q7rwa_45", ke = "_body_q7rwa_56", _e = "_collapsed_q7rwa_67", Te = "_divider_q7rwa_79", $e = "_item_q7rwa_88", Ie = "_active_q7rwa_103", Ke = "_empty_q7rwa_108", Ce = "_toolItem_q7rwa_114", Se = "_toolIndicator_q7rwa_119", Ne = "_indicatorOn_q7rwa_127", qe = "_indicatorOff_q7rwa_134", Me = "_toolName_q7rwa_141", Ve = {
  container: ve,
  header: be,
  move: pe,
  toggle: we,
  body: ke,
  collapsed: _e,
  divider: Te,
  item: $e,
  active: Ie,
  empty: Ke,
  toolItem: Ce,
  toolIndicator: Se,
  indicatorOn: Ne,
  indicatorOff: qe,
  toolName: Me
}, Ae = {
  $style: Ve
}, Ee = /* @__PURE__ */ E(ge, [["__cssModules", Ae]]), Oe = /* @__PURE__ */ D({
  __name: "AffinityDetailsLoader",
  setup(v) {
    const c = X("plugin:name"), b = K((c == null ? void 0 : c.value) === "koishi-plugin-chatluna-affinity");
    return (T, s) => b.value ? (m(), se(Ee, { key: 0 })) : Y("", !0);
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
