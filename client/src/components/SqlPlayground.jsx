import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, 
  Play, 
  Code2, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Terminal, 
  Sparkles, 
  ChevronRight,
  ChevronDown,
  Copy,
  Download,
  Table2,
  Layers,
  History,
  X
} from 'lucide-react';

export default function SqlPlayground() {
  const [queries, setQueries] = useState([]);
  const [selectedQueryId, setSelectedQueryId] = useState('');
  const [sqlCode, setSqlCode] = useState('');
  const [activeConcept, setActiveConcept] = useState('');

  // Execution Result
  const [result, setResult] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState(null);

  // Schema Explorer
  const [schemaTables, setSchemaTables] = useState([]);
  const [expandedTable, setExpandedTable] = useState(null);
  const [tableDetail, setTableDetail] = useState({});
  const [schemaTab, setSchemaTab] = useState('queries'); // 'queries' | 'schema'

  // Query History
  const [queryHistory, setQueryHistory] = useState([]);

  const textareaRef = useRef(null);

  useEffect(() => {
    loadQueries();
    loadSchema();
  }, []);

  const loadQueries = async () => {
    try {
      const res = await fetch('/api/sql/queries');
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        setQueries(json.data);
        selectPreset(json.data[0]);
      }
    } catch (err) {
      console.error('Error loading SQL queries:', err);
    }
  };

  const loadSchema = async () => {
    try {
      const res = await fetch('/api/sql/tables');
      const json = await res.json();
      if (json.success) setSchemaTables(json.data);
    } catch (err) {
      console.error('Error loading schema:', err);
    }
  };

  const loadTableDetail = async (tableName) => {
    if (tableDetail[tableName]) return; // cached
    try {
      const res = await fetch(`/api/sql/tables/${tableName}`);
      const json = await res.json();
      if (json.success) {
        setTableDetail(prev => ({ ...prev, [tableName]: json.data }));
      }
    } catch (err) {
      console.error('Error loading table detail:', err);
    }
  };

  const toggleTable = (tableName) => {
    if (expandedTable === tableName) {
      setExpandedTable(null);
    } else {
      setExpandedTable(tableName);
      loadTableDetail(tableName);
    }
  };

  const selectPreset = (q) => {
    setSelectedQueryId(q.id);
    setSqlCode(q.sql);
    setActiveConcept(q.concept);
    setError(null);
  };

  const executeSql = async () => {
    if (!sqlCode.trim()) return;
    setIsExecuting(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/sql/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: sqlCode })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'SQL execution failed');
      }

      setResult(json);
      // Track history
      setQueryHistory(prev => [{
        sql: sqlCode,
        rowCount: json.rowCount,
        timeMs: json.executionTimeMs,
        ts: new Date().toLocaleTimeString()
      }, ...prev.slice(0, 9)]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsExecuting(false);
    }
  };

  const exportCsv = () => {
    if (!result || result.isMutation || result.rows.length === 0) return;
    const header = result.columns.join(',');
    const rows = result.rows.map(row =>
      result.columns.map(col => {
        const val = row[col];
        if (val === null) return '';
        const str = String(val);
        return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
      }).join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_result_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyResultJson = () => {
    if (!result?.rows) return;
    navigator.clipboard.writeText(JSON.stringify(result.rows, null, 2));
  };

  const insertTableName = (name) => {
    setSqlCode(prev => `SELECT * FROM ${name} LIMIT 25;`);
    setSchemaTab('queries');
    setActiveConcept('');
    setSelectedQueryId('');
  };

  // Keyboard shortcut: Ctrl+Enter to run
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      executeSql();
    }
  };

  return (
    <div>
      {/* Header Banner */}
      <div className="card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #1e1b4b, #0f172a)', color: 'white', borderColor: '#312e81' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Sparkles size={20} color="#a5b4fc" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>DBMS Concepts & SQL Query Explorer</h2>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
              Live schema explorer + classroom SQL demonstrations. Press <kbd style={{ background: '#312e81', padding: '1px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>Ctrl+Enter</kbd> to execute.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['JOINs', 'GROUP BY', 'HAVING', 'Subqueries', 'Triggers', 'Views'].map(tag => (
              <span key={tag} className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#a5b4fc' }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
        {/* Left Column: Tab Panel */}
        <div>
          {/* Tab Switcher */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '4px', marginBottom: '14px', gap: '4px' }}>
            {[
              { id: 'queries', label: 'Exam Queries', icon: Code2 },
              { id: 'schema', label: 'Schema', icon: Database },
              { id: 'history', label: 'History', icon: History }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSchemaTab(tab.id)}
                  style={{
                    flex: 1,
                    padding: '6px 4px',
                    borderRadius: '6px',
                    border: 'none',
                    background: schemaTab === tab.id ? 'white' : 'transparent',
                    color: schemaTab === tab.id ? '#4f46e5' : '#64748b',
                    fontWeight: schemaTab === tab.id ? 700 : 500,
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    boxShadow: schemaTab === tab.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Icon size={12} /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* QUERIES TAB */}
          {schemaTab === 'queries' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#334155', marginBottom: '2px' }}>
                Showcase Exam Queries ({queries.length})
              </div>
              {queries.map((q, idx) => {
                const isSelected = selectedQueryId === q.id;
                return (
                  <div
                    key={q.id}
                    onClick={() => selectPreset(q)}
                    className={`query-preset-card ${isSelected ? 'active' : ''}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4f46e5' }}>Q{idx + 1}</span>
                      <Code2 size={13} color="#64748b" />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e293b', marginBottom: '3px' }}>{q.title}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}><b>Concepts:</b> {q.concept}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* SCHEMA EXPLORER TAB */}
          {schemaTab === 'schema' && (
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#334155', marginBottom: '10px' }}>
                Live Database Schema ({schemaTables.length} Tables)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {schemaTables.map(tbl => {
                  const isExpanded = expandedTable === tbl.table_name;
                  const detail = tableDetail[tbl.table_name];
                  return (
                    <div key={tbl.table_name} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                      <div
                        onClick={() => toggleTable(tbl.table_name)}
                        style={{ 
                          padding: '9px 12px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between', 
                          cursor: 'pointer', 
                          background: isExpanded ? '#eef2ff' : '#f8fafc',
                          userSelect: 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Table2 size={14} color={isExpanded ? '#4f46e5' : '#64748b'} />
                          <span style={{ fontWeight: 700, fontSize: '0.8rem', color: isExpanded ? '#4f46e5' : '#334155', fontFamily: 'monospace' }}>
                            {tbl.table_name}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{tbl.row_count} rows</span>
                          {isExpanded ? <ChevronDown size={14} color="#64748b" /> : <ChevronRight size={14} color="#64748b" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div style={{ background: 'white', padding: '8px 12px', borderTop: '1px solid #e2e8f0' }}>
                          <button
                            onClick={() => insertTableName(tbl.table_name)}
                            style={{ fontSize: '0.68rem', color: '#4f46e5', background: '#eef2ff', border: 'none', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer', marginBottom: '8px', fontWeight: 600 }}
                          >
                            ▶ SELECT * FROM {tbl.table_name}
                          </button>

                          {detail ? (
                            <div>
                              {detail.columns?.map((col, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', padding: '3px 0', borderBottom: i < detail.columns.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                  <span style={{ fontFamily: 'monospace', color: col.pk ? '#7c3aed' : '#1e293b', fontWeight: col.pk ? 700 : 500 }}>
                                    {col.pk ? '🔑 ' : ''}{col.name}
                                    {col.notnull ? '' : '?'}
                                  </span>
                                  <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{col.type}</span>
                                </div>
                              ))}
                              {detail.foreignKeys?.length > 0 && (
                                <div style={{ marginTop: '6px', fontSize: '0.68rem', color: '#64748b' }}>
                                  <span style={{ fontWeight: 700 }}>FK refs:</span>{' '}
                                  {detail.foreignKeys.map(fk => `${fk.from}→${fk.table}.${fk.to}`).join(', ')}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Loading columns…</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* HISTORY TAB */}
          {schemaTab === 'history' && (
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#334155', marginBottom: '10px' }}>
                Recent Executions
              </div>
              {queryHistory.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>
                  No queries run yet this session.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {queryHistory.map((h, i) => (
                    <div
                      key={i}
                      onClick={() => { setSqlCode(h.sql); setActiveConcept(''); setSelectedQueryId(''); setSchemaTab('queries'); }}
                      style={{ padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', background: '#f8fafc' }}
                    >
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '3px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{h.ts}</span>
                        <span>{h.rowCount != null ? `${h.rowCount} rows` : 'mutation'} · {h.timeMs}ms</span>
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {h.sql.slice(0, 80)}…
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: SQL Editor & Output Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* SQL Editor Box */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={18} color="#4f46e5" />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>SQL Command Editor</span>
                {activeConcept && (
                  <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{activeConcept}</span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => { setSqlCode(''); setResult(null); setError(null); setActiveConcept(''); setSelectedQueryId(''); }}
                  style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 10px', fontSize: '0.75rem', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={13} /> Clear
                </button>
                <button
                  onClick={executeSql}
                  disabled={isExecuting}
                  className="btn btn-primary"
                  style={{ padding: '8px 18px' }}
                >
                  <Play size={15} fill="white" /> {isExecuting ? 'Executing…' : 'Run Query'}
                </button>
              </div>
            </div>

            <textarea
              ref={textareaRef}
              rows="9"
              value={sqlCode}
              onChange={(e) => setSqlCode(e.target.value)}
              onKeyDown={handleKeyDown}
              className="sql-editor-box"
              style={{ width: '100%', resize: 'vertical' }}
              spellCheck="false"
              placeholder="-- Write or select any SQL query above and press Run Query (or Ctrl+Enter)..."
            />
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ padding: '14px 18px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#ef4444', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>SQL Execution Error</div>
                <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', marginTop: '2px' }}>{error}</div>
              </div>
            </div>
          )}

          {/* Execution Result Area */}
          {result && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} color="#10b981" />
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    {result.isMutation ? 'Execution Successful' : `Results: ${result.rowCount} row(s) returned`}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                    <Clock size={14} />
                    <span><b>{result.executionTimeMs} ms</b></span>
                  </div>
                  {!result.isMutation && result.rows?.length > 0 && (
                    <>
                      <button
                        onClick={copyResultJson}
                        style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 8px', fontSize: '0.72rem', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Copy size={12} /> JSON
                      </button>
                      <button
                        onClick={exportCsv}
                        style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 8px', fontSize: '0.72rem', cursor: 'pointer', color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                      >
                        <Download size={12} /> Export CSV
                      </button>
                    </>
                  )}
                </div>
              </div>

              {result.isMutation ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#10b981', fontWeight: 600 }}>
                  {result.message}
                </div>
              ) : (
                <div className="table-responsive" style={{ maxHeight: '380px' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        {result.columns.map((col, idx) => (
                          <th key={idx}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.length === 0 ? (
                        <tr>
                          <td colSpan={result.columns.length} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                            Empty result set — 0 rows matched
                          </td>
                        </tr>
                      ) : (
                        result.rows.map((row, rowIdx) => (
                          <tr key={rowIdx}>
                            {result.columns.map((col, colIdx) => (
                              <td key={colIdx}>
                                {row[col] === null ? (
                                  <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>NULL</span>
                                ) : (
                                  typeof row[col] === 'number' ? row[col] : String(row[col])
                                )}
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
