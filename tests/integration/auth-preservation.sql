CREATE TEMP TABLE before_rows(name text PRIMARY KEY, digest text, count bigint);
DO $$ DECLARE t record; d text; n bigint; BEGIN
 FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename NOT IN ('auth_session','auth_verification','schema_migrations') LOOP
  IF t.tablename='auth_account' THEN
   SELECT md5(coalesce(string_agg(row_to_json(x)::text,E'\n' ORDER BY row_to_json(x)::text),'')),count(*) INTO d,n FROM (SELECT id,account_id,provider_id,user_id,password,created_at,updated_at FROM auth_account) x;
  ELSE EXECUTE format('SELECT md5(coalesce(string_agg(row_to_json(x)::text,E''\n'' ORDER BY row_to_json(x)::text),'''')),count(*) FROM %I x',t.tablename) INTO d,n;END IF;
  INSERT INTO before_rows VALUES(t.tablename,d,n);
 END LOOP;
END $$;
\i /tmp/nest-auth.sql
DO $$ DECLARE t record; d text; n bigint; target text; BEGIN
 FOR t IN SELECT * FROM before_rows LOOP
  target:=CASE t.name WHEN 'auth_user' THEN 'users' WHEN 'auth_account' THEN 'auth_identities' ELSE t.name END;
  IF t.name='auth_account' THEN
   SELECT md5(coalesce(string_agg(row_to_json(x)::text,E'\n' ORDER BY row_to_json(x)::text),'')),count(*) INTO d,n FROM (SELECT id,account_id,provider_id,user_id,password,created_at,updated_at FROM auth_identities) x;
  ELSE EXECUTE format('SELECT md5(coalesce(string_agg(row_to_json(x)::text,E''\n'' ORDER BY row_to_json(x)::text),'''')),count(*) FROM %I x',target) INTO d,n;END IF;
  IF d<>t.digest OR n<>t.count THEN RAISE EXCEPTION 'Mismatch on %',target;END IF;
 END LOOP;
END $$;
SELECT 'PASS all preserved tables/identity fields/password hashes/card/due/version/revlogs' AS result,count(*) AS tables_checked FROM before_rows;
