(function(window) {
  "use strict";

  var messages = {
    "en-US": {
      operations: "Operations", up: "Up", reload: "Reload", create: "Create",
      edit: "Edit", remove: "Delete", actions: "Actions", none: "None",
      filter: "Filter", sortBy: "Sort By", notSorted: "(Not Sorted)",
      direction: "Direction", sort: "Sort", notAvailable: "Not available",
      pagination: "Pagination", fullResult: "Full result", limit: "Limit",
      set: "Set", collection: "Collection", resource: "Resource", links: "Links",
      data: "Data", fields: "Fields", fieldName: "Field Name", type: "Type",
      value: "Value", schemaName: "schema name", noActionInputs: "This action has no inputs",
      noEditableFields: "This resource has no fields that can be edited",
      noSettableFields: "This resource has no fields that can be set",
      logOut: "Log Out", jsonView: "JSON View", documentation: "Documentation",
      clear: "Clear", add: "Add", apply: "Apply", curlCommand: "cURL command line",
      httpRequest: "HTTP Request", httpResponse: "HTTP Response",
      clickToSend: "Click below to send request.", waiting: "Waiting for response...",
      responseHeadersUnavailable: "Response headers not available.",
      loadingError: "Error loading API Explorer", nothingSelected: "Nothing is selected",
      selectedCount: "items are selected", language: "Language", explorerView: "Explorer View"
    },
    "zh-TW": {
      operations: "操作", up: "上一層", reload: "重新載入", create: "建立",
      edit: "編輯", remove: "刪除", actions: "動作", none: "無",
      filter: "篩選", sortBy: "排序欄位", notSorted: "（未排序）",
      direction: "方向", sort: "排序", notAvailable: "不適用",
      pagination: "分頁", fullResult: "完整結果", limit: "筆數上限",
      set: "套用", collection: "集合", resource: "資源", links: "連結",
      data: "資料", fields: "欄位", fieldName: "欄位名稱", type: "類型",
      value: "值", schemaName: "結構名稱", noActionInputs: "此動作沒有輸入欄位",
      noEditableFields: "此資源沒有可編輯欄位", noSettableFields: "此資源沒有可設定欄位",
      logOut: "登出", jsonView: "JSON 檢視", documentation: "文件",
      clear: "清除", add: "新增", apply: "套用", curlCommand: "cURL 命令列",
      httpRequest: "HTTP 請求", httpResponse: "HTTP 回應",
      clickToSend: "按下方按鈕以送出請求。", waiting: "正在等待回應…",
      responseHeadersUnavailable: "沒有可用的回應標頭。",
      loadingError: "API Explorer 載入失敗", nothingSelected: "尚未選取任何項目",
      selectedCount: "個項目已選取", language: "語言", explorerView: "探索器檢視"
    }
  };

  function normalize(value) {
    return String(value || "").toLowerCase() === "zh-tw" ? "zh-TW" : "en-US";
  }

  function initialLocale() {
    var saved = null;
    try { saved = window.localStorage.getItem("pasturestack.locale"); } catch (e) {}
    return normalize(window.pasturestackLocale || saved || document.documentElement.lang);
  }

  var locale = initialLocale();

  window.PastureStackI18n = {
    getLocale: function() { return locale; },
    text: function(key) {
      return (messages[locale] && messages[locale][key]) || messages["en-US"][key] || key;
    },
    syncSelectors: function() {
      var selectors = document.querySelectorAll(".pasturestack-locale");
      for (var i = 0; i < selectors.length; i++) selectors[i].value = locale;
    },
    setLocale: function(value) {
      locale = normalize(value);
      try { window.localStorage.setItem("pasturestack.locale", locale); } catch (e) {}
      document.documentElement.lang = locale;
      window.location.reload();
    }
  };

  document.documentElement.lang = locale;
}(window));
