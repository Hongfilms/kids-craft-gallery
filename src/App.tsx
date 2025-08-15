import { useEffect, useMemo, useRef, useState } from "react";

// ✅ 사용 방법 (요약)
// 1) 인스타그램 영상 자체를 직접 불러오는 것은 인스타 정책상/기술적으로 제한이 있으니,
//    아래 갤러리에는 다음 중 하나의 방법으로 영상을 넣어 보여주세요.
//    - (권장) 크리에이터에게 허락받아 mp4 파일을 다운로드/보관 후, 이 페이지와 같은 폴더의 /videos 에 넣기
//    - 직접 소유한 mp4 링크(예: 본인 클라우드 스토리지의 공개 mp4 URL)를 붙여넣기
// 2) 아래 초기 예시에 맞춰 items 배열을 수정하거나, 상단의 "영상 추가" 버튼으로 제목/썸네일/영상 URL을 입력하면
//    브라우저에만 저장(localStorage)되어 다음 방문에도 유지됩니다. (개인 PC에서 아이에게 보여줄 용도)
// 3) 이 파일 하나로 정적 호스팅(예: GitHub Pages, Netlify) 또는 로컬에서 열어도 작동합니다.
// 4) 디자인은 아동 친화적, 광고/댓글/추천 없이 깔끔하게 구성되어 있습니다.

export default function KidsCraftGallery() {
  const [items, setItems] = useState<VideoItem[]>(() => {
    const saved = localStorage.getItem("kidsCraftGallery.items");
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return defaultItems; // 아래의 예시 데이터
  });
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [active, setActive] = useState<VideoItem | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    localStorage.setItem("kidsCraftGallery.items", JSON.stringify(items));
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((v) =>
      (v.title || "").toLowerCase().includes(q) ||
      (v.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  }, [items, query]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Logo/>
          <div className="flex-1"/>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAdd(true)} className="px-3 py-2 rounded-2xl border border-gray-200 shadow-sm hover:shadow transition">영상 추가</button>
            <button onClick={() => setConfirmClear(true)} className="px-3 py-2 rounded-2xl border border-gray-200 hover:bg-gray-50">초기화</button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 pb-4">
          <SearchBar value={query} onChange={setQuery} />
        </div>
      </header>

      {/* 안내 배너 */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <InfoBanner />
      </div>

      {/* 갤러리 그리드 */}
      <main className="max-w-6xl mx-auto p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((item, idx) => (
          <Card key={idx} item={item} onOpen={() => setActive(item)} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-20">
            해당하는 영상이 없어요. 상단의 "영상 추가" 버튼을 눌러보세요.
          </div>
        )}
      </main>

      {/* 모달: 영상 재생 */}
      {active && (
        <VideoModal item={active} onClose={() => setActive(null)} />
      )}

      {/* 모달: 영상 추가 */}
      {showAdd && (
        <AddModal
          onClose={() => setShowAdd(false)}
          onSubmit={(v) => {
            setItems((prev) => [v, ...prev]);
            setShowAdd(false);
          }}
        />
      )}

      {/* 모달: 초기화 확인 */}
      {confirmClear && (
        <ConfirmModal
          title="모든 사용자 추가 영상 삭제"
          desc="추가한 영상 목록(브라우저 저장분)을 모두 지울까요? 기본 예시는 그대로 남습니다."
          onCancel={() => setConfirmClear(false)}
          onConfirm={() => {
            localStorage.removeItem("kidsCraftGallery.items");
            setItems(defaultItems);
            setConfirmClear(false);
          }}
        />
      )}

      <footer className="max-w-6xl mx-auto px-4 py-10 text-xs text-gray-400">
        본 페이지는 아이에게 안전하게 보여주기 위한 개인 용도의 갤러리입니다. 외부 플랫폼의 정책을 준수하며,
        타인의 콘텐츠는 허락을 받아 사용하세요.
      </footer>
    </div>
  );
}

// ---- 컴포넌트들 ----

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-200 to-amber-400 border border-amber-300 shadow-sm flex items-center justify-center">
        <span className="text-xl">✂️</span>
      </div>
      <div>
        <div className="font-semibold leading-tight">만드릭 TV</div>
        <div className="text-xs text-gray-500 -mt-0.5">아이전용, 광고/댓글 없음</div>
      </div>
    </div>
  );
}

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="제목 또는 태그로 검색 (예: slime, snow, paper)"
        className="w-full rounded-2xl border border-gray-200 px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-amber-300"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2">🔎</span>
    </div>
  );
}

function InfoBanner() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed">
      <p className="font-medium">📌 인스타그램 직접 재생은 불가</p>
      <p className="mt-1 text-gray-700">플랫폼 정책상 로그인 없이 Instagram 동영상을 직접 임베드/재생할 수 없습니다. 대신, 아래 방법으로 안전하게 보여줄 수 있어요.</p>
      <ul className="list-disc pl-5 mt-2 text-gray-700 space-y-1">
        <li>크리에이터 허락 후 mp4 파일을 보관하여 <code className="px-1 bg-white rounded border">/videos</code> 폴더에 넣기</li>
        <li>본인 소유의 클라우드에 올린 mp4 <b>직접 링크</b> 사용(접근 권한 공개)</li>
        <li>공유 가능한 썸네일 이미지를 함께 지정하면 아이가 고르기 좋아요</li>
      </ul>
    </div>
  );
}

function Card({ item, onOpen }: { item: VideoItem; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="text-left group rounded-2xl border border-gray-200 overflow-hidden bg-white hover:shadow-md transition">
      <div className="aspect-video w-full bg-gray-100 relative">
        {item.thumbnail ? (
          <img src={item.thumbnail} alt="thumb" className="absolute inset-0 w-full h-full object-cover"/>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl">🎬</div>
        )}
      </div>
      <div className="p-3">
        <div className="font-medium line-clamp-1">{item.title}</div>
        {item.tags?.length ? (
          <div className="mt-1 flex flex-wrap gap-1">
            {item.tags.slice(0,3).map((t, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200">#{t}</span>
            ))}
          </div>
        ) : null}
      </div>
    </button>
  );
}

function VideoModal({ item, onClose }: { item: VideoItem; onClose: () => void }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" role="dialog" aria-modal>
      <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="font-semibold">{item.title}</div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">✖️</button>
        </div>
        <div className="p-0">
          {/* 비디오 플레이어 */}
          <video ref={ref} controls className="w-full h-auto" poster={item.thumbnail}>
            {/* mp4 권장 */}
            <source src={item.videoUrl} type="video/mp4" />
            {/* webm 등 추가 소스가 있으면 아래 주석을 참조하여 추가하세요.
            <source src={item.videoWebmUrl} type="video/webm" />
            */}
            이 브라우저는 HTML5 동영상을 지원하지 않아요.
          </video>
        </div>
        {item.description && (
          <div className="px-4 py-3 text-sm text-gray-600 border-t">{item.description}</div>
        )}
      </div>
    </div>
  );
}

function AddModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (v: VideoItem) => void }) {
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [tags, setTags] = useState("");

  const canSave = title.trim() && videoUrl.trim();

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal>
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="font-semibold">영상 추가</div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">✖️</button>
        </div>
        <div className="p-4 space-y-3">
          <Field label="제목" placeholder="예: 눈송이 슬라임 만들기" value={title} onChange={setTitle} />
          <Field label="썸네일 이미지 URL" placeholder="(선택) jpg/png 주소" value={thumbnail} onChange={setThumbnail} />
          <Field label="영상(mp4) URL" placeholder="https://... .mp4" value={videoUrl} onChange={setVideoUrl} />
          <Field label="태그" placeholder="쉼표로 구분 (예: slime, snow, paper)" value={tags} onChange={setTags} />
          <p className="text-xs text-gray-500">* mp4 직접 링크만 재생돼요. 개인 클라우드/직접 호스팅을 사용하세요.</p>
        </div>
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t bg-gray-50">
          <button onClick={onClose} className="px-3 py-2 rounded-2xl border border-gray-200">취소</button>
          <button
            onClick={() => canSave && onSubmit({
              title: title.trim(),
              thumbnail: thumbnail.trim() || undefined,
              videoUrl: videoUrl.trim(),
              tags: tags.split(",").map(s => s.trim()).filter(Boolean),
            })}
            disabled={!canSave}
            className={`px-4 py-2 rounded-2xl text-white ${canSave ? 'bg-amber-500 hover:bg-amber-600' : 'bg-gray-300 cursor-not-allowed'}`}
          >저장</button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ title, desc, onCancel, onConfirm }: { title: string; desc: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal>
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-4 py-3 border-b font-semibold">{title}</div>
        <div className="px-4 py-4 text-sm text-gray-700">{desc}</div>
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t bg-gray-50">
          <button onClick={onCancel} className="px-3 py-2 rounded-2xl border border-gray-200">취소</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-2xl text-white bg-red-500 hover:bg-red-600">삭제</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-300" />
    </label>
  );
}

// ---- 타입 & 예시 데이터 ----

type VideoItem = {
  title: string;
  thumbnail?: string;
  videoUrl: string; // mp4 권장
  videoWebmUrl?: string;
  description?: string;
  tags?: string[];
};

// 초기 예시는 로컬 파일/임의 링크 예시입니다. 실제 사용 시 바꿔주세요.
const defaultItems: VideoItem[] = [
  {
    title: "색종이 왕관 만들기",
    thumbnail: "https://images.unsplash.com/photo-1556306535-abccb3b5bebe?q=80&w=600&auto=format&fit=crop",
    videoUrl: "videos/paper-crown.mp4", // 이 파일을 /videos 폴더에 넣어주세요
    tags: ["paper", "crown", "kids"],
  },
  {
    title: "슬라임 반짝이 섞기",
    thumbnail: "https://images.unsplash.com/photo-1561322043-1023e0b1f0ef?q=80&w=600&auto=format&fit=crop",
    videoUrl: "videos/slime-glitter.mp4",
    tags: ["slime", "glitter"],
  },
  {
    title: "솜사탕 구름 병 만들기",
    thumbnail: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop",
    videoUrl: "videos/cloud-jar.mp4",
    tags: ["jar", "cloud"],
  },
];
