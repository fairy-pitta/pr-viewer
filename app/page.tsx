// page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

const TYPING_SPEED = 50;
const DEMO_PRS = [
  { title: 'feat: Add user authentication', repo: 'acme/app', action: 'NEEDS YOUR REVIEW', status: 'red' },
  { title: 'fix: Resolve memory leak in worker', repo: 'acme/core', action: 'ADDRESS FEEDBACK', status: 'red' },
  { title: 'chore: Update dependencies', repo: 'acme/infra', action: 'READY TO MERGE', status: 'green' },
  { title: 'docs: Improve API documentation', repo: 'acme/docs', action: 'WAITING FOR REVIEW', status: 'gray' },
];

export default function Home() {
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [activeDemo, setActiveDemo] = useState(0);
  const fullText = 'pr-viewer --sync';

  useEffect(() => {
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typeInterval);
      }
    }, TYPING_SPEED);

    return () => clearInterval(typeInterval);
  }, []);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    const demoInterval = setInterval(() => {
      setActiveDemo(prev => (prev + 1) % DEMO_PRS.length);
    }, 2000);
    return () => clearInterval(demoInterval);
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Terminal Header */}
        <div className={styles.terminalHeader}>
          <div className={styles.terminalDots}>
            <span className={styles.dotRed} />
            <span className={styles.dotYellow} />
            <span className={styles.dotGreen} />
          </div>
          <span className={styles.terminalTitle}>pr-viewer — bash</span>
        </div>

        {/* Terminal Content */}
        <div className={styles.terminalBody}>
          {/* Command Line */}
          <div className={styles.commandLine}>
            <span className={styles.prompt}>$</span>
            <span className={styles.command}>{typedText}</span>
            <span className={`${styles.cursor} ${showCursor ? '' : styles.cursorHidden}`}>_</span>
          </div>

          {/* Output */}
          <div className={styles.output}>
            <p className={styles.outputLine}>Syncing pull requests...</p>
            <p className={styles.outputLine}>Found 4 PRs requiring attention</p>
            <br />

            {/* Demo PR List */}
            <div className={styles.demoPRs}>
              {DEMO_PRS.map((pr, idx) => (
                <div
                  key={idx}
                  className={`${styles.demoPR} ${idx === activeDemo ? styles.demoPRActive : ''}`}
                >
                  <span className={`${styles.demoIndicator} ${styles[`indicator${pr.status.charAt(0).toUpperCase() + pr.status.slice(1)}`]}`} />
                  <span className={`${styles.demoAction} ${styles[`action${pr.status.charAt(0).toUpperCase() + pr.status.slice(1)}`]}`}>
                    [{pr.action}]
                  </span>
                  <span className={styles.demoTitle}>{pr.title}</span>
                  <span className={styles.demoRepo}>{pr.repo}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Features as comments */}
          <div className={styles.features}>
            <p className={styles.comment}># Features:</p>
            <p className={styles.comment}># - See all PRs you need to review</p>
            <p className={styles.comment}># - Track who approved/requested changes</p>
            <p className={styles.comment}># - Auto-sync every 10 minutes</p>
            <p className={styles.comment}># - Works with CodeRabbit, Copilot, and more</p>
          </div>

          {/* CTA */}
          <div className={styles.cta}>
            <div className={styles.commandLine}>
              <span className={styles.prompt}>$</span>
              <span className={styles.command}>./start.sh</span>
            </div>
            <div className={styles.buttons}>
              <Link href="/login" className={styles.primaryButton}>
                [ENTER] Login with GitHub
              </Link>
              <Link href="/prs" className={styles.secondaryButton}>
                [SPACE] View Demo
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <span>Press [ENTER] to start</span>
          <span className={styles.footerDivider}>|</span>
          <span>ESC to exit</span>
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className={styles.shortcuts}>
        <kbd>G</kbd> GitHub
        <kbd>H</kbd> Help
        <kbd>?</kbd> Shortcuts
      </div>
    </main>
  );
}
