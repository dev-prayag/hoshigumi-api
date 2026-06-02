import React from 'react';
import { CodeBlock } from './code-block';
import { Badge } from './badge';

interface EndpointCardProps {
  id: string;
  method: string;
  path: string;
  title: string;
  description: string;
  params?: { name: string; type: string; required: boolean; description: string }[];
  responseCode: string;
  curlCode: string;
}

export function EndpointCard({ id, method, path, title, description, params, responseCode, curlCode }: EndpointCardProps) {
  return (
    <div id={id} className="scroll-mt-24 mb-20 relative">
      <div className="flex items-center gap-3 mb-3">
        <h3 className="text-2xl font-bold tracking-tight text-foreground">{title}</h3>
      </div>
      <p className="text-muted-foreground mb-6 max-w-2xl text-base">{description}</p>
      
      <div className="flex items-center gap-3 p-3.5 rounded-lg bg-[#090b0f] border border-border shadow-inner mb-8 font-mono text-sm">
        <Badge variant="default" className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20 rounded font-bold px-2 py-0.5">{method}</Badge>
        <span className="text-foreground break-all">{path}</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.2fr] gap-8 xl:gap-12">
        <div className="flex flex-col gap-8">
          {params && params.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-4 uppercase tracking-widest border-b border-border pb-2">Parameters</h4>
              <div className="border border-border rounded-lg overflow-hidden bg-[#090b0f]">
                <table className="w-full text-sm text-left">
                  <tbody className="divide-y divide-border">
                    {params.map(p => (
                      <tr key={p.name} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-4 py-3.5 font-mono align-top w-1/3">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-cyan-400 font-semibold">{p.name}</span>
                              {p.required ? <span className="text-[9px] uppercase tracking-wider text-red-400 border border-red-400/20 bg-red-400/10 px-1.5 py-0.5 rounded-sm font-sans">required</span> : <span className="text-[9px] uppercase tracking-wider text-muted-foreground border border-border bg-muted/30 px-1.5 py-0.5 rounded-sm font-sans">optional</span>}
                            </div>
                            <div className="text-[11px] text-muted-foreground uppercase">{p.type}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground align-top text-[13px] leading-relaxed">
                          {p.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div>
            <h4 className="text-xs font-semibold text-foreground mb-4 uppercase tracking-widest border-b border-border pb-2">Request</h4>
            <CodeBlock code={curlCode} language="bash" />
          </div>
        </div>
        
        <div>
          <h4 className="text-xs font-semibold text-foreground mb-4 uppercase tracking-widest border-b border-border pb-2">Response</h4>
          <CodeBlock code={responseCode} language="json" />
        </div>
      </div>
      
      <div className="absolute -inset-x-8 -inset-y-8 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none rounded-3xl transition-opacity duration-500" />
    </div>
  );
}
