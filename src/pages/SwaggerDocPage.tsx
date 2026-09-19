import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { FileCode2, Copy, Check, Play, ShieldAlert, Key, ExternalLink } from 'lucide-react';

export const SwaggerDocPage: React.FC = () => {
  const { token, user } = useAuth();
  const [openApiSpec, setOpenApiSpec] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [testResult, setTestResult] = useState<any>(null);
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpec = async () => {
      try {
        const res = await api.get('/openapi.json');
        setOpenApiSpec(res.data);
      } catch (err) {
        console.error('Failed to load openapi.json', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSpec();
  }, []);

  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTestCall = async (method: string, path: string) => {
    setTestingEndpoint(path);
    setTestResult(null);
    try {
      let res;
      if (method.toLowerCase() === 'get') {
        res = await api.get(path);
      } else {
        res = { data: 'Execute via Swagger interface or form' };
      }
      setTestResult({ status: 200, data: res.data });
    } catch (err: any) {
      setTestResult({
        status: err.response?.status || 500,
        data: err.response?.data || err.message,
      });
    } finally {
      setTestingEndpoint(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-500">
        Loading OpenAPI Documentation...
      </div>
    );
  }

  const endpoints = openApiSpec?.paths
    ? Object.entries(openApiSpec.paths).flatMap(([path, methods]: [string, any]) =>
        Object.entries(methods).map(([method, details]: [string, any]) => ({
          path,
          method: method.toUpperCase(),
          summary: details.summary || details.description || '',
          tags: details.tags || ['General'],
          security: details.security,
          responses: details.responses,
        }))
      )
    : [];

  const tags = ['All', ...Array.from(new Set(endpoints.flatMap((e) => e.tags)))];

  const filteredEndpoints = endpoints.filter((e) => {
    if (activeCategory === 'All') return true;
    return e.tags.includes(activeCategory);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            <FileCode2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">OpenAPI 3.0 & REST API Documentation</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-950 border border-indigo-500/40 text-indigo-300">
                v1.0.0
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Interactive documentation for all role-based endpoints, approval steps, and security validations.
            </p>
          </div>
        </div>

        {/* Active Bearer Token Box */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3 max-w-sm w-full">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span className="font-semibold flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-amber-400" /> Active JWT Bearer Token:
            </span>
            <button
              onClick={handleCopyToken}
              disabled={!token}
              className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <p className="font-mono text-[10px] text-slate-400 truncate bg-slate-950/60 p-1.5 rounded-md">
            {token ? `Bearer ${token}` : 'Not logged in (Authenticate above to attach token)'}
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveCategory(tag)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeCategory === tag
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Endpoints List */}
      <div className="space-y-3">
        {filteredEndpoints.map((ep, idx) => {
          const methodColor =
            ep.method === 'GET'
              ? 'bg-blue-100 text-blue-800 border-blue-300'
              : ep.method === 'POST'
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : ep.method === 'PUT'
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : 'bg-rose-100 text-rose-800 border-rose-300';

          return (
            <div
              key={`${ep.method}-${ep.path}-${idx}`}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-md font-mono text-xs font-extrabold border ${methodColor}`}>
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900">{ep.path}</span>
                  <span className="text-xs text-slate-500 hidden md:inline">— {ep.summary}</span>
                </div>

                <div className="flex items-center gap-2">
                  {ep.security && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      BearerAuth
                    </span>
                  )}
                  {ep.method === 'GET' && (
                    <button
                      onClick={() => handleTestCall(ep.method, ep.path)}
                      disabled={testingEndpoint === ep.path}
                      className="flex items-center gap-1 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition"
                    >
                      <Play className="w-3 h-3 text-emerald-400" />
                      <span>{testingEndpoint === ep.path ? 'Calling...' : 'Try it out'}</span>
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-600 md:hidden">{ep.summary}</p>
            </div>
          );
        })}
      </div>

      {/* Live Test Result Modal or Box */}
      {testResult && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-semibold text-xs text-slate-300">
              API Response Status: <strong className="text-emerald-400">{testResult.status} OK</strong>
            </span>
            <button
              onClick={() => setTestResult(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
          <pre className="p-4 bg-slate-950 rounded-xl overflow-x-auto text-[11px] font-mono text-emerald-300 max-h-60">
            {JSON.stringify(testResult.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
