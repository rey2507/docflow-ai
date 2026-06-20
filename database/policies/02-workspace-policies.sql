CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (id = auth.uid());

CREATE POLICY "Workspace members can view workspace"
ON workspaces
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM workspace_members wm
    WHERE wm.workspace_id = workspaces.id
    AND wm.user_id = auth.uid()
  )
);

CREATE POLICY "Workspace members can view documents"
ON documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM workspace_members wm
    WHERE wm.workspace_id = documents.workspace_id
    AND wm.user_id = auth.uid()
  )
);

CREATE POLICY "Workspace members can insert documents"
ON documents
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM workspace_members wm
    WHERE wm.workspace_id = documents.workspace_id
    AND wm.user_id = auth.uid()
  )
);

CREATE POLICY "Workspace members can update documents"
ON documents
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM workspace_members wm
    WHERE wm.workspace_id = documents.workspace_id
    AND wm.user_id = auth.uid()
  )
);