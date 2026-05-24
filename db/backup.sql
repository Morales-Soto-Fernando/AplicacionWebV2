--
-- PostgreSQL database dump
--

\restrict bU5hCcz5l7IU31h51OZR2EhULspPJLLIu5CdzaD96tAQiA4rQhHwR05nKYvtOpG

-- Dumped from database version 16.12 (Debian 16.12-1.pgdg13+1)
-- Dumped by pg_dump version 16.12 (Debian 16.12-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: InventoryCondition; Type: TYPE; Schema: public; Owner: gamerent
--

CREATE TYPE public."InventoryCondition" AS ENUM (
    'NEW',
    'GOOD',
    'FAIR',
    'DAMAGED'
);


ALTER TYPE public."InventoryCondition" OWNER TO gamerent;

--
-- Name: InventoryStatus; Type: TYPE; Schema: public; Owner: gamerent
--

CREATE TYPE public."InventoryStatus" AS ENUM (
    'AVAILABLE',
    'RESERVED',
    'IN_RENT',
    'MAINTENANCE',
    'RETIRED'
);


ALTER TYPE public."InventoryStatus" OWNER TO gamerent;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: gamerent
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'ACTIVE',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."OrderStatus" OWNER TO gamerent;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: gamerent
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CASH',
    'CARD',
    'TRANSFER'
);


ALTER TYPE public."PaymentMethod" OWNER TO gamerent;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: gamerent
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PAID',
    'REFUNDED'
);


ALTER TYPE public."PaymentStatus" OWNER TO gamerent;

--
-- Name: ProductCategory; Type: TYPE; Schema: public; Owner: gamerent
--

CREATE TYPE public."ProductCategory" AS ENUM (
    'CONSOLE',
    'ACCESSORY',
    'GAME'
);


ALTER TYPE public."ProductCategory" OWNER TO gamerent;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: InventoryUnit; Type: TABLE; Schema: public; Owner: gamerent
--

CREATE TABLE public."InventoryUnit" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    status public."InventoryStatus" DEFAULT 'AVAILABLE'::public."InventoryStatus" NOT NULL,
    condition public."InventoryCondition" DEFAULT 'GOOD'::public."InventoryCondition" NOT NULL,
    "serialNumber" text NOT NULL
);


ALTER TABLE public."InventoryUnit" OWNER TO gamerent;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: gamerent
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    "customerName" text NOT NULL,
    "customerEmail" text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    currency text DEFAULT 'MXN'::text NOT NULL,
    "customerPhone" text,
    "totalCents" integer NOT NULL,
    "paymentMethod" public."PaymentMethod" DEFAULT 'CASH'::public."PaymentMethod" NOT NULL,
    "paymentStatus" public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL
);


ALTER TABLE public."Order" OWNER TO gamerent;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: gamerent
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "inventoryUnitId" text,
    "productId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "lineTotalCents" integer NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    "unitPriceCents" integer NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."OrderItem" OWNER TO gamerent;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: gamerent
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    name text NOT NULL,
    brand text NOT NULL,
    description text,
    "imageUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    category public."ProductCategory" DEFAULT 'CONSOLE'::public."ProductCategory" NOT NULL,
    currency text DEFAULT 'MXN'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    model text,
    "priceCents" integer NOT NULL
);


ALTER TABLE public."Product" OWNER TO gamerent;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: gamerent
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO gamerent;

--
-- Data for Name: InventoryUnit; Type: TABLE DATA; Schema: public; Owner: gamerent
--

COPY public."InventoryUnit" (id, "productId", "createdAt", notes, "updatedAt", status, condition, "serialNumber") FROM stdin;
f6eefc19-8a46-471b-9e29-7ace6f357845	07e24db7-35a4-4fa7-b290-6cd04459e6de	2026-04-07 19:00:24.008	Robot White.	2026-04-09 18:27:17.054	AVAILABLE	GOOD	XWC-0001
08722580-193b-4821-b628-c12c2740cf16	d5de42cd-e75e-4757-a132-1aa1078c31a2	2026-04-07 19:00:24.008	Incluye dock.	2026-04-07 19:00:52.688	AVAILABLE	GOOD	NSOLED-0001
11b91f68-b77a-4ab3-9e00-c9cf6b0d3db0	710e416c-2894-45ab-8d62-7fa74ab9ace4	2026-04-07 19:00:24.008	Disco sin detalles.	2026-05-20 18:59:30.287	AVAILABLE	GOOD	ER-PS5-0002
dd9dc5ce-d1cd-45c1-a5eb-e495c35f386a	072b70d7-c0c9-4a2d-8cdd-590d3e856542	2026-04-07 19:00:24.008	Incluye 1 control.	2026-04-07 19:00:24.008	AVAILABLE	GOOD	PS5SLIM-0001
12da67a0-e8a8-4512-b3ef-4716e8ad2346	072b70d7-c0c9-4a2d-8cdd-590d3e856542	2026-04-07 19:00:24.008	Consola lista para renta.	2026-04-07 19:00:24.008	AVAILABLE	GOOD	PS5SLIM-0002
9baade36-9d7c-4754-b147-55ec6d0421eb	072b70d7-c0c9-4a2d-8cdd-590d3e856542	2026-04-07 19:00:24.008	Revisión de ventilación.	2026-04-07 19:00:24.008	MAINTENANCE	FAIR	PS5SLIM-0003
39c53e8b-638d-48b8-8a19-4208f60e52a9	d5de42cd-e75e-4757-a132-1aa1078c31a2	2026-04-07 19:00:24.008	Joy-Con en buen estado.	2026-04-07 19:00:24.008	AVAILABLE	GOOD	NSOLED-0002
4163c242-defc-43b8-80e1-8865628915f0	20a77904-371d-4185-915b-b260f0fd70b0	2026-04-07 19:00:24.008	Control blanco.	2026-04-07 19:00:24.008	AVAILABLE	GOOD	DS-0001
e2d4d8fc-a64d-4bdf-847f-89fa1be9139c	20a77904-371d-4185-915b-b260f0fd70b0	2026-04-07 19:00:24.008	Incluye cable de carga.	2026-04-07 19:00:24.008	AVAILABLE	GOOD	DS-0002
de60ce8c-1d5e-4aa6-8ad4-1dc457a8fb8d	07e24db7-35a4-4fa7-b290-6cd04459e6de	2026-04-07 19:00:24.008	Desgaste leve en sticks.	2026-04-07 19:00:24.008	AVAILABLE	FAIR	XWC-0002
e8b5255b-ad6a-419f-ade7-346de2d88ba4	b25e4e7b-be19-40a8-9365-4e416dae6b1d	2026-04-07 19:00:24.008	Control funcional.	2026-04-07 19:00:24.008	AVAILABLE	GOOD	NPC-0001
c7991c58-0490-44ae-a3a9-eee0f569d1b8	b25e4e7b-be19-40a8-9365-4e416dae6b1d	2026-04-07 19:00:24.008	Incluye cable USB-C.	2026-04-07 19:00:24.008	AVAILABLE	GOOD	NPC-0002
88e38506-a981-40ef-8ba9-f99627536604	e478c373-6921-41d1-ac44-98c37e8a46f5	2026-04-07 19:00:24.008	Cartucho en excelente estado.	2026-04-07 19:00:24.008	AVAILABLE	GOOD	TOTK-0001
2d69f619-a872-4d9a-ab7e-8c8ffcfb4a2b	e478c373-6921-41d1-ac44-98c37e8a46f5	2026-04-07 19:00:24.008	Caja original.	2026-04-07 19:00:24.008	AVAILABLE	GOOD	TOTK-0002
5fd1b37a-a6b4-41e7-9583-38f5c2acd051	09b4a354-d4b5-4c12-844c-9881092deeb1	2026-04-07 19:00:24.008	Cartucho funcional.	2026-04-07 19:00:24.008	AVAILABLE	GOOD	MK8D-0001
87760b6d-9621-451c-a611-eb2b88eeced5	09b4a354-d4b5-4c12-844c-9881092deeb1	2026-04-07 19:00:24.008	Caja original.	2026-04-07 19:00:24.008	AVAILABLE	GOOD	MK8D-0002
ec572a6b-3a16-4af0-b37a-83c8533a023c	dd87dc9f-4490-4cac-b2d8-471241eea651	2026-04-07 19:00:24.008	Disco PS5.	2026-04-07 19:00:24.008	AVAILABLE	GOOD	SM2-PS5-0001
be694abd-393c-49a6-8bd7-15cc16f4fb39	79c0d865-eb48-4d60-baf7-02fd0b81c521	2026-04-07 19:00:24.008	Versión física Xbox.	2026-04-07 19:00:24.008	AVAILABLE	GOOD	HALO-0001
dc1bceb4-c6d6-4ab9-ad96-093a14fd58f1	19d5cab1-e2fa-433f-ae26-79528f98f3d2	2026-04-07 19:00:24.008	Audífonos Xbox.	2026-05-20 21:28:57.495	AVAILABLE	GOOD	XHS-0001
56f31e7f-41fd-48f8-98cf-5722c8aae355	710e416c-2894-45ab-8d62-7fa74ab9ace4	2026-04-07 19:00:24.008	Caja original.	2026-04-07 19:04:10.162	AVAILABLE	GOOD	ER-PS5-0001
ddf02bd4-695f-4f15-8ab9-302a2dee4135	650ff37c-afa5-48ed-8cbb-bcd604654600	2026-04-07 19:00:24.008	Consola completa.	2026-05-21 00:41:01.094	MAINTENANCE	GOOD	XSX-0001
b3a7aebb-a210-41ba-88c9-51d04f565afb	5ba83730-7512-46c1-affc-61a6f932260b	2026-04-07 19:00:24.008	Cartucho funcional.	2026-05-21 00:42:00.163	MAINTENANCE	GOOD	SSBU-0001
d57089d7-0ffa-4805-a5f5-4aa59cf6612a	15f29a4a-b5a6-40d1-b14f-5f4a169259c8	2026-04-07 19:00:24.008	Audífonos PS5.	2026-05-21 00:42:26.142	AVAILABLE	GOOD	PULSE3D-0001
9f603fe6-9c5b-4ba4-9884-9464f907fdbb	650ff37c-afa5-48ed-8cbb-bcd604654600	2026-04-07 19:00:24.008	Incluye control.	2026-05-21 00:43:35.635	AVAILABLE	GOOD	XSX-0002
8d5b8f35-ac4f-4da1-9590-7bd254b0ebc4	fc1db853-558e-48c1-8b5e-ce7610d0d0a2	2026-04-07 19:00:24.008	Cartucho funcional.	2026-05-21 01:02:43.856	AVAILABLE	GOOD	ACNH-0001
bb039c92-edaf-49d9-be4b-50d8427e32fa	a4621295-e8e7-4f0e-9cae-6b684b9d6fba	2026-04-07 19:00:24.008	Versión física Xbox.	2026-05-21 01:02:43.856	AVAILABLE	GOOD	FH5-0001
daa7b22d-eb39-4365-bf00-962d72fb8223	4f06a057-5b69-4acb-ae01-c937358a564a	2026-04-07 19:00:24.008	Color gris.	2026-05-21 01:27:10.081	AVAILABLE	GOOD	SWLITE-0001
c2cbace4-b2eb-4287-887b-9f7d6eb9d968	710e416c-2894-45ab-8d62-7fa74ab9ace4	2026-05-21 20:55:27.202	Juego usado	2026-05-21 20:57:02.824	AVAILABLE	FAIR	123456789
02994a25-6bdd-4048-a2a1-a6ed16274728	060b1c56-4e46-4266-8266-3c8d12649450	2026-05-21 20:43:11.543	Unidad creada automáticamente al registrar el producto.	2026-05-21 20:57:19.836	MAINTENANCE	NEW	XBOX360-0001
c7883a70-af91-4245-9f3b-e1f59ae28d9a	0a4084ee-4f30-4cf2-ac37-429404860baa	2026-04-07 19:00:24.008	512GB OLED.	2026-05-21 21:31:03.434	AVAILABLE	GOOD	SDECK-0001
cc109ae2-97d4-43d5-9ada-14e0fab645f0	0a4084ee-4f30-4cf2-ac37-429404860baa	2026-04-07 19:00:24.008	Incluye cargador.	2026-05-21 21:40:25.785	AVAILABLE	GOOD	SDECK-0002
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: gamerent
--

COPY public."Order" (id, status, "customerName", "customerEmail", "startDate", "endDate", "createdAt", "updatedAt", currency, "customerPhone", "totalCents", "paymentMethod", "paymentStatus") FROM stdin;
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: gamerent
--

COPY public."OrderItem" (id, "orderId", "inventoryUnitId", "productId", "createdAt", "lineTotalCents", quantity, "unitPriceCents", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: gamerent
--

COPY public."Product" (id, name, brand, description, "imageUrl", "createdAt", "updatedAt", category, currency, "isActive", model, "priceCents") FROM stdin;
072b70d7-c0c9-4a2d-8cdd-590d3e856542	PlayStation 5 Slim	Sony	Consola PS5 Slim (incluye 1 control).		2026-04-07 19:00:23.954	2026-04-07 19:00:23.954	CONSOLE	MXN	t	CFI-2000	1649900
d5de42cd-e75e-4757-a132-1aa1078c31a2	Nintendo Switch OLED	Nintendo	Nintendo Switch versión OLED.		2026-04-07 19:00:23.967	2026-04-07 19:00:23.967	CONSOLE	MXN	t	OLED	599900
0a4084ee-4f30-4cf2-ac37-429404860baa	Steam Deck OLED	Valve	Consola portátil Steam Deck OLED.		2026-04-07 19:00:23.969	2026-04-07 19:00:23.969	CONSOLE	MXN	t	OLED 512GB	1439900
4f06a057-5b69-4acb-ae01-c937358a564a	Nintendo Switch Lite	Nintendo	Nintendo Switch Lite portátil.		2026-04-07 19:00:23.971	2026-04-07 19:00:23.971	CONSOLE	MXN	t	Lite	429900
20a77904-371d-4185-915b-b260f0fd70b0	DualSense	Sony	Control inalámbrico DualSense para PS5.		2026-04-07 19:00:23.975	2026-04-07 19:00:23.975	ACCESSORY	MXN	t	Wireless Controller	146000
07e24db7-35a4-4fa7-b290-6cd04459e6de	Xbox Wireless Controller	Microsoft	Control inalámbrico para Xbox Series.		2026-04-07 19:00:23.977	2026-04-07 19:00:23.977	ACCESSORY	MXN	t	Robot White	106900
b25e4e7b-be19-40a8-9365-4e416dae6b1d	Nintendo Pro Controller	Nintendo	Control Pro para Nintendo Switch.		2026-04-07 19:00:23.979	2026-04-07 19:00:23.979	ACCESSORY	MXN	t	Switch Pro	149900
15f29a4a-b5a6-40d1-b14f-5f4a169259c8	PULSE 3D Headset	Sony	Audífonos inalámbricos para PS5.		2026-04-07 19:00:23.981	2026-04-07 19:00:23.981	ACCESSORY	MXN	t	Wireless	189900
19d5cab1-e2fa-433f-ae26-79528f98f3d2	Xbox Wireless Headset	Microsoft	Audífonos inalámbricos Xbox.		2026-04-07 19:00:23.983	2026-04-07 19:00:23.983	ACCESSORY	MXN	t	Wireless	219900
e478c373-6921-41d1-ac44-98c37e8a46f5	The Legend of Zelda: TOTK	Nintendo	Juego para Nintendo Switch.		2026-04-07 19:00:23.985	2026-04-07 19:00:23.985	GAME	MXN	t	Switch	99900
09b4a354-d4b5-4c12-844c-9881092deeb1	Mario Kart 8 Deluxe	Nintendo	Juego para Nintendo Switch.		2026-04-07 19:00:23.987	2026-04-07 19:00:23.987	GAME	MXN	t	Switch	106500
710e416c-2894-45ab-8d62-7fa74ab9ace4	Elden Ring	FromSoftware	Juego de aventura/acción (versión PS5).		2026-04-07 19:00:23.989	2026-04-07 19:00:23.989	GAME	MXN	t	PS5	79900
dd87dc9f-4490-4cac-b2d8-471241eea651	Marvel's Spider-Man 2	Sony	Juego de acción para PlayStation 5.		2026-04-07 19:00:23.991	2026-04-07 19:00:23.991	GAME	MXN	t	PS5	119900
79c0d865-eb48-4d60-baf7-02fd0b81c521	Halo Infinite	Xbox Game Studios	Shooter para Xbox.		2026-04-07 19:00:23.993	2026-04-07 19:00:23.993	GAME	MXN	t	Xbox	89900
a4621295-e8e7-4f0e-9cae-6b684b9d6fba	Forza Horizon 5	Xbox Game Studios	Juego de carreras para Xbox.		2026-04-07 19:00:23.995	2026-04-07 19:00:23.995	GAME	MXN	t	Xbox	99900
fc1db853-558e-48c1-8b5e-ce7610d0d0a2	Animal Crossing: New Horizons	Nintendo	Juego de simulación para Nintendo Switch.		2026-04-07 19:00:23.997	2026-04-07 19:00:23.997	GAME	MXN	t	Switch	109900
5ba83730-7512-46c1-affc-61a6f932260b	Super Smash Bros. Ultimate	Nintendo	Juego de peleas para Nintendo Switch.		2026-04-07 19:00:23.998	2026-05-21 00:36:50.53	GAME	MXN	t	Switch	99900
650ff37c-afa5-48ed-8cbb-bcd604654600	Xbox Series X	Microsoft	Consola Xbox Series X.		2026-04-07 19:00:23.964	2026-05-21 20:48:49.508	CONSOLE	MXN	t	Series X	1549900
060b1c56-4e46-4266-8266-3c8d12649450	Xbox 360	Microsoft	Xbox fat antiguo		2026-05-21 20:43:11.525	2026-05-21 20:52:08.156	CONSOLE	MXN	t	Fat	120000
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: gamerent
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
466f4608-1eda-4bfb-bc2e-7d678112b1c2	f0bdd681b214f20f19971b70d4f4a54a71db91985ab802ce4a62faf51a62a6ed	2026-02-13 22:53:50.472555+00	20260213225350_init	\N	\N	2026-02-13 22:53:50.413736+00	1
8420a463-b1d6-4a12-b2e3-0516910d0f01	e5b9a8038fa688af6abc470879fe8ffaeaffbf4b520fc650ab0bce7ea3f57050	2026-02-15 19:10:30.341121+00	20260215191030_models	\N	\N	2026-02-15 19:10:30.296857+00	1
ec8ce275-355b-4206-9619-f9d0458c2b8f	9fec8467b54f5c9823c934f80d1947b27baa14538c7a39a9048337f0fa4d2e47	2026-02-15 20:24:26.779312+00	20260215202426_add_product_model	\N	\N	2026-02-15 20:24:26.668006+00	1
5807a2a5-1350-4fe1-bef6-5e564e3ff2be	09f70b7f85dc08cca1024fbbe1f29537c47cacdbed6361766218096f0476cc80	2026-05-20 18:48:02.283153+00	20260520184802_add_payment_system	\N	\N	2026-05-20 18:48:02.265566+00	1
\.


--
-- Name: InventoryUnit InventoryUnit_pkey; Type: CONSTRAINT; Schema: public; Owner: gamerent
--

ALTER TABLE ONLY public."InventoryUnit"
    ADD CONSTRAINT "InventoryUnit_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: gamerent
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: gamerent
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: gamerent
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: gamerent
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: InventoryUnit_productId_idx; Type: INDEX; Schema: public; Owner: gamerent
--

CREATE INDEX "InventoryUnit_productId_idx" ON public."InventoryUnit" USING btree ("productId");


--
-- Name: InventoryUnit_serialNumber_key; Type: INDEX; Schema: public; Owner: gamerent
--

CREATE UNIQUE INDEX "InventoryUnit_serialNumber_key" ON public."InventoryUnit" USING btree ("serialNumber");


--
-- Name: InventoryUnit_status_idx; Type: INDEX; Schema: public; Owner: gamerent
--

CREATE INDEX "InventoryUnit_status_idx" ON public."InventoryUnit" USING btree (status);


--
-- Name: OrderItem_inventoryUnitId_idx; Type: INDEX; Schema: public; Owner: gamerent
--

CREATE INDEX "OrderItem_inventoryUnitId_idx" ON public."OrderItem" USING btree ("inventoryUnitId");


--
-- Name: OrderItem_orderId_idx; Type: INDEX; Schema: public; Owner: gamerent
--

CREATE INDEX "OrderItem_orderId_idx" ON public."OrderItem" USING btree ("orderId");


--
-- Name: OrderItem_productId_idx; Type: INDEX; Schema: public; Owner: gamerent
--

CREATE INDEX "OrderItem_productId_idx" ON public."OrderItem" USING btree ("productId");


--
-- Name: Product_brand_idx; Type: INDEX; Schema: public; Owner: gamerent
--

CREATE INDEX "Product_brand_idx" ON public."Product" USING btree (brand);


--
-- Name: Product_category_idx; Type: INDEX; Schema: public; Owner: gamerent
--

CREATE INDEX "Product_category_idx" ON public."Product" USING btree (category);


--
-- Name: Product_isActive_idx; Type: INDEX; Schema: public; Owner: gamerent
--

CREATE INDEX "Product_isActive_idx" ON public."Product" USING btree ("isActive");


--
-- Name: InventoryUnit InventoryUnit_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gamerent
--

ALTER TABLE ONLY public."InventoryUnit"
    ADD CONSTRAINT "InventoryUnit_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_inventoryUnitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gamerent
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_inventoryUnitId_fkey" FOREIGN KEY ("inventoryUnitId") REFERENCES public."InventoryUnit"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gamerent
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gamerent
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict bU5hCcz5l7IU31h51OZR2EhULspPJLLIu5CdzaD96tAQiA4rQhHwR05nKYvtOpG

