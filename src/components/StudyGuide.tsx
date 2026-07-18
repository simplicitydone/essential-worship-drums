import type { GlossaryItem, QuizItem } from '../types/drums'
import { useLang } from '../lib/lang'

export function StudyGuide({ quiz, glossary }: { quiz: QuizItem[]; glossary: GlossaryItem[] }) {
  const { lang } = useLang()
  return (
    <div className="section">
      <h2 className="section__heading">{lang === 'kr' ? '학습 확인' : 'Study Guide'}</h2>
      <p className="section__lead">
        {lang === 'kr'
          ? '배운 내용을 확인해보자. 질문을 읽고 머릿속으로 답한 뒤 펼쳐서 확인한다.'
          : 'Check what stuck. Read the question, answer it in your head, then open it.'}
      </p>

      <div className="study-guide__quiz">
        {quiz.map((item, i) => (
          <details key={i} className="quiz-item">
            <summary>
              <span className="quiz-item__num">Q{i + 1}.</span>{' '}
              {lang === 'kr' ? item.questionKr : item.question}
            </summary>
            <p className="quiz-item__answer">{lang === 'kr' ? item.answerKr : item.answer}</p>
          </details>
        ))}
      </div>

      <h3 className="study-guide__heading">{lang === 'kr' ? '핵심 용어' : 'Glossary'}</h3>
      <dl className="glossary">
        {glossary.map((g) => (
          <div key={g.term} className="glossary__entry">
            <dt>{lang === 'kr' ? g.termKr : g.term}</dt>
            <dd>{lang === 'kr' ? g.definitionKr : g.definition}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
