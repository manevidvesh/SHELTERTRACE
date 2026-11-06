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
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'REJECTED':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'INCONCLUSIVE':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'FIELD_NOTE_ADDED':
      default:
        return 'bg-sky-50 text-sky-800 border-sky-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-stone-200 overflow-hidden shadow-xs text-xs p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#233f33]" />
          <h3 className="font-semibold text-stone-900 text-xs tracking-tight">
            Human Review & Audit History Trail ({entries.length} entries)
          </h3>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-2.5 py-1 rounded bg-[#233f33] hover:bg-[#1a3027] text-white text-xs font-medium flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>{isFormOpen ? 'Cancel Review Entry' : 'Append Review Action'}</span>
        </button>
      </div>

      {/* Prototype Audit Safeguard Disclaimer */}
      <div className="p-3 rounded bg-stone-50 border border-stone-200 flex items-start gap-2.5 text-xs text-stone-600">
        <Info className="w-4 h-4 text-[#233f33] shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          <strong>Storage & Authorization Notice:</strong> In-session demonstration log stored in local React component state (resets on browser reload). Designed to demonstrate append-only audit trail architecture. Does NOT claim authenticated user identity, cryptographic signing, or statutory legal authorization.
        </p>
      </div>

      {/* Append New Review Form */}
      {isFormOpen && (
        <form
          onSubmit={handleAddEntry}
          className="p-4 rounded-lg bg-stone-50 border border-stone-300 space-y-3"
        >
          <span className="font-semibold text-stone-900 text-xs block">
            Record New Human Review / Field Verification Action
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-stone-600 font-medium block mb-1">Reviewer Role</label>
              <input
                type="text"
                value={reviewerRole}
                onChange={e => setReviewerRole(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded p-1.5 text-stone-900 text-xs focus:border-stone-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-stone-600 font-medium block mb-1">Review Action</label>
              <select
                value={action}
                onChange={e => setAction(e.target.value as ReviewActionType)}
                className="w-full bg-white border border-stone-300 rounded p-1.5 text-stone-900 text-xs focus:border-stone-500 focus:outline-none"
              >
                <option value="ACCEPTED">ACCEPTED (Verified On Ground)</option>
                <option value="REJECTED">REJECTED (Disproven / Outdated)</option>
                <option value="INCONCLUSIVE">INCONCLUSIVE (Requires Follow-Up)</option>
                <option value="FIELD_NOTE_ADDED">FIELD_NOTE_ADDED</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-stone-600 font-medium block mb-1">Target Evidence Item</label>
              <select
                value={targetEvidenceId}
                onChange={e => setTargetEvidenceId(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded p-1.5 text-stone-900 text-xs focus:border-stone-500 focus:outline-none"
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
            <label className="text-[11px] text-stone-600 font-medium block mb-1">
              Documented Justification / Change Reason (Mandatory)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Verified mud line on standing walls; confirmed 4 dwellings scoured."
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded p-1.5 text-stone-900 text-xs focus:border-stone-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] text-stone-600 font-medium block mb-1">
              Field Reconnaissance Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Observations recorded during rapid visual damage inspection..."
              value={observationText}
              onChange={e => setObservationText(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded p-1.5 text-stone-900 text-xs focus:border-stone-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-3 py-1.5 rounded bg-stone-200 text-stone-700 text-xs hover:bg-stone-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 rounded bg-[#233f33] text-white font-medium text-xs hover:bg-[#1a3027] transition-colors cursor-pointer"
            >
              Append Entry to Local Log
            </button>
          </div>
        </form>
      )}

      {/* Review Entries List */}
      <div className="space-y-3">
        {entries.length === 0 ? (
          <div className="p-4 rounded-lg bg-stone-50 text-center text-stone-500 text-xs">
            No local human review actions recorded for {habitation.name} yet.
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 space-y-2 hover:bg-[#fbfaf8] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1.5 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-stone-500" />
                  <span className="font-semibold text-stone-900 text-xs">{entry.reviewerRole}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getActionBadge(entry.action)}`}>
                    {entry.action}
                  </span>
                </div>

                <div className="text-[11px] text-stone-500 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-stone-400" />
                  <span>{new Date(entry.timestamp).toLocaleString()}</span>
                </div>
              </div>

              {/* State Transition */}
              <div className="flex items-center gap-2 text-[11px] text-stone-500 font-mono">
                <span>Transition:</span>
                <span className="bg-white px-1.5 py-0.5 rounded border border-stone-200 text-stone-700">
                  {entry.previousState}
                </span>
                <span>&rarr;</span>
                <span className="bg-white px-1.5 py-0.5 rounded border border-stone-200 text-stone-900 font-medium">
                  {entry.newState}
                </span>
              </div>

              {/* Justification */}
              <div className="text-xs text-stone-700 leading-relaxed">
                <span className="text-stone-500 text-[10px] uppercase font-medium block">
                  Documented Rationale:
                </span>
                <p className="bg-white p-2 rounded border border-stone-200 mt-0.5 text-stone-800">{entry.changeReason}</p>
              </div>

              {/* Field Note */}
              {entry.fieldObservationText && (
                <div className="text-xs text-stone-700 leading-relaxed">
                  <span className="text-stone-500 text-[10px] uppercase font-medium block">
                    Field Reconnaissance Note:
                  </span>
                  <p className="bg-white p-2 rounded border border-stone-200 mt-0.5 italic text-stone-600">
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
