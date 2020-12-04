CREATE TRIGGER update_changetimestamp BEFORE UPDATE
ON properties FOR EACH ROW EXECUTE PROCEDURE
update_modified_column();