import { useState } from 'react';
import { Shield, PlusCircle, Clock, Info, UserCheck } from 'lucide-react';
import type { Habitation } from '../../types/habitation';
import type { ReviewAuditEntry, ReviewActionType } from '../../types/evidence';
import { getReviewAuditEntriesForHabitation } from '../../data/reviewAuditHistory';

interface LocalReviewAuditSectionProps {
  habitation: Habitation;
}

export function LocalReviewAuditSection({ habitation }: LocalReviewAuditSectionProps) {
  const [entries, setEntries] = useState<ReviewAuditEntry[]>(() =>
    getReviewAuditEntriesForHabitation(habitation.id)
  );

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [reviewerRole, setReviewerRole] = useState<string>('District Geotechnical Officer (Field Patrol)');
  const [action, setAction] = useState<ReviewActionType>('ACCEPTED');
  const [targetEvidenceId, setTargetEvidenceId] = useState<string>(
    habitation.evidence[0]?.id || ''
  );
  const [reason, setReason] = useState<string>('');
  const [observationText, setObservationText] = useState<string>('');

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    const targetItem = habitation.evidence.find(ev => ev.id === targetEvidenceId);

    const newEntry: ReviewAuditEntry = {
      id: `rev-${Date.now()}`,
      habitationId: habitation.id,
      timestamp: new Date().toISOString(),
      reviewerRole: reviewerRole.trim() || 'Field Geotechnical Officer',
      action,
      targetEvidenceId: targetEvidenceId || undefined,
      previousState: `STATUS: ${targetItem?.status || 'UNREVIEWED'}`,
      newState: `STATUS: REVIEW_${action}`,
      changeReason: reason.trim(),
      fieldObservationText: observationText.trim() || undefined,
    };

    setEntries(prev => [newEntry, ...prev]);
    setReason('');
    setObservationText('');
    setIsFormOpen(false);
  };

  const getActionBadge = (act: ReviewActionType) => {
    switch (act) {
      case 'ACCEPTED':
        return 'bg-emerald-950/70 text-emerald-300 border-emerald-800';
      case 'REJECTED':
        return 'bg-rose-950/70 text-rose-300 border-rose-800';
      case 'INCONCLUSIVE':
        return 'bg-amber-950/70 text-amber-300 border-amber-800';
      case 'FIELD_NOTE_ADDED':
      default:
        return 'bg-sky-950/70 text-sky-300 border-sky-800';
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-lg border border-slate-800 overflow-hidden shadow-xl text-xs p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <h3 className="font-mono font-bold uppercase tracking-wider text-slate-100 text-xs">
            Human-Review & Audit History Trail ({entries.length} entries)
          </h3>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-mono text-[11px] flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>{isFormOpen ? 'Cancel Review Entry' : 'Append Review Action'}</span>
        </button>
      </div>

      {/* Prototype Audit Safeguard Disclaimer */}
      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-400 font-mono">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Storage & Authorization Notice:</strong> In-session demonstration log stored in local React component state (resets on browser reload). Designed to demonstrate append-only audit trail architecture. Does NOT claim authenticated user identity, cryptographic signing, or statutory legal authorization.
        </p>
      </div>

      {/* Append New Review Form */}
      {isFormOpen && (
        <form
          onSubmit={handleAddEntry}
          className="p-4 rounded-lg bg-slate-950 border border-rose-900/60 space-y-3"
        >
          <span className="font-mono font-bold text-rose-300 text-xs block">
            Record New Human Review / Field Verification Action
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Reviewer Role</label>
              <input
                type="text"
                value={reviewerRole}
                onChange={e => setReviewerRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 text-xs font-mono focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Review Action</label>
              <select
                value={action}
                onChange={e => setAction(e.target.value as ReviewActionType)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 text-xs font-mono focus:border-rose-500 focus:outline-none"
              >
                <option value="ACCEPTED">ACCEPTED (Verified On Ground)</option>
                <option value="REJECTED">REJECTED (Disproven / Outdated)</option>
                <option value="INCONCLUSIVE">INCONCLUSIVE (Requires Follow-Up)</option>
                <option value="FIELD_NOTE_ADDED">FIELD_NOTE_ADDED</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Target Evidence Item</label>
              <select
                value={targetEvidenceId}
                onChange={e => setTargetEvidenceId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 text-xs font-mono focus:border-rose-500 focus:outline-none"
              >
                {habitation.evidence.map(ev => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name} ({ev.domain})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1">
              Documented Justification / Change Reason (Mandatory)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Verified mud line on standing walls; confirmed 4 dwellings scoured."
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 text-xs font-sans focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1">
              Field Reconnaissance Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Observations recorded during rapid visual damage inspection..."
              value={observationText}
              onChange={e => setObservationText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 text-xs font-sans focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 font-mono text-xs hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 rounded bg-rose-600 text-white font-mono font-bold text-xs hover:bg-rose-500 transition-colors"
            >
              Append Entry to Local Log
            </button>
          </div>
        </form>
      )}

      {/* Review Entries List */}
      <div className="space-y-3">
        {entries.length === 0 ? (
          <div className="p-4 rounded-lg bg-slate-950 text-center text-slate-500 font-mono text-xs">
            No local human review actions recorded for {habitation.name} yet.
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1.5 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                  <span className="font-mono font-bold text-slate-200 text-xs">{entry.reviewerRole}</span>
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${getActionBadge(entry.action)}`}>
                    {entry.action}
                  </span>
                </div>

                <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{new Date(entry.timestamp).toLocaleString()}</span>
                </div>
              </div>

              {/* State Transition */}
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                <span>Transition:</span>
                <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300">
                  {entry.previousState}
                </span>
                <span>&rarr;</span>
                <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-rose-300 font-bold">
                  {entry.newState}
                </span>
              </div>

              {/* Justification */}
              <div className="text-xs text-slate-300 font-sans leading-relaxed">
                <span className="text-slate-500 font-mono text-[10px] uppercase font-bold block">
                  Documented Rationale:
                </span>
                <p className="bg-slate-900/60 p-2 rounded border border-slate-800/80 mt-0.5">{entry.changeReason}</p>
              </div>

              {/* Field Note */}
              {entry.fieldObservationText && (
                <div className="text-xs text-slate-300 font-sans leading-relaxed">
                  <span className="text-slate-500 font-mono text-[10px] uppercase font-bold block">
                    Field Reconnaissance Note:
                  </span>
                  <p className="bg-slate-900/40 p-2 rounded border border-slate-800/60 mt-0.5 italic">
                    "{entry.fieldObservationText}"
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
