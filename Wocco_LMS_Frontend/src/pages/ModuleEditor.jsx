import { useEffect, useState } from "react";
import api from "../api/axios";

export default function ModuleEditor() {
  const [modules, setModules] = useState([]);
  const [selected, setSelected] = useState(null);   // { module_id, title, position, pages }
  const [activePage, setActivePage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("superuser/editor/modules/").then(r => setModules(r.data));
  }, []);

  const selectModule = (mod) => {
    setSelected(mod);
    setActivePage(mod.pages[0] || null);
    setSaved(false);
  };

  const updatePageLocal = (field, value) => {
    setActivePage(p => ({ ...p, [field]: value }));
    setSaved(false);
  };

  const savePage = async () => {
    if (!activePage) return;
    setSaving(true);
    await api.put(`superuser/editor/pages/${activePage.id}/`, {
      title: activePage.title,
      content: activePage.content,
    });
    // sync local state
    setSelected(s => ({
      ...s,
      pages: s.pages.map(p => p.id === activePage.id ? activePage : p)
    }));
    setSaving(false);
    setSaved(true);
  };

  const addPage = async () => {
    const res = await api.post(`superuser/editor/modules/${selected.module_id}/add-page/`, {
      title: "New Page", content: ""
    });
    const newPage = { ...res.data, content: "" };
    setSelected(s => ({ ...s, pages: [...s.pages, newPage] }));
    setActivePage(newPage);
  };

const deletePage = async (pageId) => {
  if (!window.confirm("Delete this page?")) return;
  await api.delete(`superuser/editor/pages/${pageId}/delete/`);  // ✅ add /delete/
  const remaining = selected.pages.filter(p => p.id !== pageId);
  setSelected(s => ({ ...s, pages: remaining }));
  setActivePage(remaining[0] || null);
};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Module Content Editor</h1>
      <div className="flex gap-6">

        {/* Sidebar: module list */}
        <div className="w-64 shrink-0 bg-white border rounded-xl p-4 h-fit">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Modules</p>
          <div className="space-y-1">
            {modules.map(m => (
              <button
                key={m.module_id}
                onClick={() => selectModule(m)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition
                  ${selected?.module_id === m.module_id
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "hover:bg-gray-50 text-gray-700"}`}
              >
                <span className="block font-medium">{m.title}</span>
                <span className="text-xs text-gray-400">{m.position}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main editor */}
        {selected ? (
          <div className="flex-1 bg-white border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {selected.title} <span className="text-sm font-normal text-gray-400">({selected.position})</span>
              </h2>
              <button
                onClick={addPage}
                className="text-sm px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                + Add Page
              </button>
            </div>

            {/* Page tabs */}
            <div className="flex gap-2 border-b pb-2 mb-4 flex-wrap">
              {selected.pages.map((p, i) => (
                <div key={p.id} className="flex items-center gap-1">
                  <button
                    onClick={() => { setActivePage(p); setSaved(false); }}
                    className={`text-sm px-3 py-1 rounded-t-lg border-b-2 transition
                      ${activePage?.id === p.id
                        ? "border-indigo-600 text-indigo-700 font-semibold"
                        : "border-transparent text-gray-500 hover:text-gray-700"}`}
                  >
                    Page {i + 1}
                  </button>
                  <button
                    onClick={() => deletePage(p.id)}
                    className="text-gray-300 hover:text-red-400 text-xs"
                    title="Delete page"
                  >✕</button>
                </div>
              ))}
            </div>

            {activePage ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Page Title</label>
                  <input
                    value={activePage.title || ""}
                    onChange={e => updatePageLocal("title", e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Content</label>
                  <textarea
                    value={activePage.content || ""}
                    onChange={e => updatePageLocal("content", e.target.value)}
                    rows={18}
                    className="w-full border rounded-lg px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-y"
                    placeholder="Write page content here (supports HTML)..."
                  />
                  <p className="text-xs text-gray-400 mt-1">HTML is supported — use &lt;b&gt;, &lt;ul&gt;, &lt;h3&gt;, etc.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={savePage}
                    disabled={saving}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 text-sm font-semibold"
                  >
                    {saving ? "Saving..." : "Save Page"}
                  </button>
                  {saved && <span className="text-green-600 text-sm">✔ Saved</span>}
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No pages yet. Click "+ Add Page" to start.</p>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Select a module to edit its content.
          </div>
        )}
      </div>
    </div>
  );
}