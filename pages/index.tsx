import Head from 'next/head';
import Image from 'next/image';
import styles from './index.module.scss';

export default function Home() {
  return (
    <div className={styles.home}>
      <Head>
        <title>Eduvault Matrix CRDT</title>
        <meta name="description" content="User-owned and Local-first" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Welcome to Eduvault</h1>
        <h3>About</h3>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad saepe, at
          corrupti placeat quis dolorem nihil quos totam voluptatum molestiae
          quam facilis ducimus, est odit fugiat voluptatibus in. Magnam, ipsum.
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad saepe, at
          corrupti placeat quis dolorem nihil quos totam voluptatum molestiae
          quam facilis ducimus, est odit fugiat voluptatibus in. Magnam, ipsum.
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad saepe, at
          corrupti placeat quis dolorem nihil quos totam voluptatum molestiae
          quam facilis ducimus, est odit fugiat voluptatibus in. Magnam, ipsum.
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad saepe, at
          corrupti placeat quis dolorem nihil quos totam voluptatum molestiae
          quam facilis ducimus, est odit fugiat voluptatibus in. Magnam, ipsum.
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad saepe, at
          corrupti placeat quis dolorem nihil quos totam voluptatum molestiae
          quam facilis ducimus, est odit fugiat voluptatibus in. Magnam, ipsum.
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad saepe, at
          corrupti placeat quis dolorem nihil quos totam voluptatum molestiae
          quam facilis ducimus, est odit fugiat voluptatibus in. Magnam, ipsum.
        </p>

        <p>
          <a href="login">Start</a> now
        </p>
      </main>
    </div>
  );
}
