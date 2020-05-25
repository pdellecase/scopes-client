import React, { useRef, useState, useEffect } from "react";
import { Badge, Button, Card, CardHeader, CardBody, Col, CustomInput, Form, FormFeedback, FormGroup, Input, Label, Row, Spinner} from "reactstrap";
import { Link } from "react-router-dom";
import {Formik,Field} from 'formik'; 
import * as yup from 'yup'; 
import { API, Storage } from "aws-amplify";
import { s3BlobUpload, s3Remove } from "../libs/awsLib";
import { formatFilename, dataURItoBlob } from "../libs/utilsLib";
import AvatarEditor from 'react-avatar-editor';
import config from "../config";
import "./UserProfile.css";

export default function UserProfile(props) {
  
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Avatar Editor controls (profile picture)
  const file = useRef(null);
  const [fileValid, setFileValid] = useState(true);
  const [avatarZoom, setAvatarZoom] = useState(1);
  const [avatarRotate, setAvatarRotate] = useState(0);
  const [avatarEditor, setAvatarEditorRef] = useState(null);
  const [avatarEdited, setAvatarEdited] = useState(false);


  useEffect(() => {
    function loadUserProfile() {
      return API.get("users", "/users/profile");
    }

    async function onLoad() {
      try {
        const userProfile = await loadUserProfile();

        const attachment = userProfile.attachment;

        if (attachment) {
          userProfile.attachmentURL = await Storage.vault.get(attachment);
        }

        setUserProfile(userProfile);
        
      } catch (e) {
        alert("Error loading User Profile: " + e);
      }
    }

    onLoad();
  }, []);


  function handleAvatarZoomChange(event) {
    setAvatarZoom(event.target.value);
    setAvatarEdited(true);
  }

  function handleAvatarRotateChange(event) {
    setAvatarRotate(event.target.value);
    setAvatarEdited(true);
  }
  
  function handleFileChange(event) {
    file.current = event.target.files[0];

    // Check if file is a supported image
    const  fileType = file.current['type'];
    const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
    if (validImageTypes.includes(fileType)) {

      if (file.current && file.current.size > config.MAX_ATTACHMENT_SIZE) {
        props.setAlertMessage(
          `Profile Picture is too large, it should be smaller than ${config.MAX_ATTACHMENT_SIZE /
            1000000} MB.`);
        props.setAlertVisible(false);
        setFileValid(false);
        return;
      }
      // Reset Avatar editor
      setAvatarZoom(1);
      if(avatarRotate===0){setAvatarRotate(360);}
      else {setAvatarRotate(0)};
      props.setAlertVisible(false);
      setFileValid(true);
    }
    else {
      props.setAlertMessage("Profile Picture format not supported. Please use png, jpeg or gif !");
      props.setAlertVisible(true);
      setFileValid(false);
    }
    
  }

  function saveUserProfile(userProfile) {
    return API.put("users", "/users", {
      body: userProfile
    });
  }
  
  async function handleSubmit(values) {
    
    let attachment;
  
    // This check should never trigger (checked before), just in case a too large attachment can go through
    if (file.current && file.current.size > config.MAX_ATTACHMENT_SIZE) {
      alert(
        `Profile Picture is too large, it should be smaller than ${config.MAX_ATTACHMENT_SIZE /
          1000000} MB.`
      );
      return;
    }
    setIsLoading(true);

    try {
      // Save to S3 edited picture from Avatar editor
      if (avatarEditor) {
        // This returns a HTMLCanvasElement, it can be made into a data URL or a blob,
        // drawn on another canvas, or added to the DOM.
        // getImageScaledToCanvas() is used to get image resized to the canvas size (also a HTMLCanvasElement)
        const canvasScaled = avatarEditor.getImageScaledToCanvas();
        var dataUrl = canvasScaled.toDataURL();
        var blobData = dataURItoBlob(dataUrl);
        // A new file was uploaded
        if(fileValid && file.current){
          attachment = await s3BlobUpload(file.current.name, blobData, file.current.type);
          // Clear old attachmnent
          if(userProfile.attachment){
            await s3Remove(userProfile.attachment);
          }  
        }
        // Existing Picture was modified
        else if(userProfile.attachment && avatarEdited){
          // Save to S3 new attachment
          attachment = await s3BlobUpload(formatFilename(userProfile.attachment), blobData, "image/png");
          // Clear old attachmnent
          await s3Remove(userProfile.attachment);
        }
      }
  
      await saveUserProfile({
        email: values.email,
        firstname: values.firstname, 
        lastname: values.lastname, 
        initials: values.initials, 
        job: values.job, 
        geography: values.geography,
        attachment: attachment || userProfile.attachment
      });

      props.setAlertVisible(false);
      
      props.history.push("/settings");

    } catch (e) {
      props.setAlertMessage(e.message);
      props.setAlertVisible(true);
      setIsLoading(false);
    }
  }
  
  return (
    <div className="UserProfile">

      <h3><center>Edit Profile</center></h3>
      {userProfile && (

        <Formik
          initialValues={{ email: userProfile.email, firstname: userProfile.firstname, lastname: userProfile.lastname, initials: userProfile.initials, job: userProfile.job, geography: userProfile.geography, profile: userProfile.profile}}
          validationSchema={yup.object().shape({
            email: yup.string()
            .email('A valid Email address is required')
            .required('Email is required'),
            firstname: yup.string()
            .required('Please enter your First Name'),
            lastname: yup.string()
            .required('Please enter your Last Name'),
            initials: yup.string()
            .required('Please enter your Initials'),
            job: yup.string()
            .required('Please enter your role'),
            geography: yup.string()
            .required('Please enter your region'),
            profile: yup.string()
            .required('Profile is required'),
          })}
          onSubmit={values => {
            handleSubmit(values);
          }}
        >
          {({ errors, touched, handleSubmit}) => (
            
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label for="email">Email</Label>
              <Input type="email" name="email" disabled tag={Field} invalid={errors.email && touched.email} component='input'/>
              <FormFeedback>{errors.email}</FormFeedback>
            </FormGroup>
            <FormGroup>
              <Label for="profile">App. Profile</Label>
              <Input type="text" name="profile" disabled tag={Field} invalid={errors.profile && touched.profile} component='input'/>
              <FormFeedback>{errors.profile}</FormFeedback>
            </FormGroup>
            <FormGroup>
              <Label for="firstname">First Name</Label>
              <Input type="text" name="firstname" autoFocus tag={Field} invalid={errors.firstname && touched.firstname} component='input'/>
              <FormFeedback>{errors.firstname}</FormFeedback>
            </FormGroup>
            <FormGroup>
              <Label for="lastname">Last Name</Label>
              <Input type="text" name="lastname" tag={Field} invalid={errors.lastname && touched.lastname} component='input'/>
              <FormFeedback>{errors.lastname}</FormFeedback>
            </FormGroup>
            <FormGroup>
              <Label for="initials">Initials</Label>
              <Input type="text" name="initials" tag={Field} invalid={errors.initials && touched.initials} component='input'/>
              <FormFeedback>{errors.initials}</FormFeedback>
            </FormGroup>
            <FormGroup>
              <Label for="job">Role</Label>
              <Input type="select" name="job" id="job" tag={Field} invalid={errors.job && touched.job} component='select'>     
                <option value="">Select</option>
                <option value="Solution Architect">Solution Architect</option>
                <option value="Solution Consultant">Solution Consultant</option>
                <option value="Customer Success Consultant">Customer Success Consultant</option>
                <option value="Account Executive">Account Executive</option>
                <option value="Manager">Manager</option>
                <option value="Other">Other</option>
              </Input>
              <FormFeedback>{errors.job}</FormFeedback>
            </FormGroup>
            <FormGroup>
              <Label for="geography">Region</Label>
              <Input type="select" name="geography" id="geography" tag={Field} invalid={errors.geography && touched.geography} component='select'>
                <option value="">Select</option>
                <option value="AMER">AMER</option>
                <option value="APAC">APAC</option>
                <option value="EMEA">EMEA</option>
                <option value="LATAM">LATAM</option>
              </Input>
              <FormFeedback>{errors.geography}</FormFeedback>
            </FormGroup>
            <FormGroup>
              <Card>
                <CardHeader>Profile Picture&nbsp;&nbsp;&nbsp;<Badge color="secondary" pill>{(fileValid && file.current)? ("New picture"):(userProfile.attachment?(formatFilename(userProfile.attachment)):("No picture uploaded"))}</Badge></CardHeader>
                <CardBody>
                  <AvatarEditor
                    ref={setAvatarEditorRef}
                    image={(fileValid && file.current)? (file.current):(userProfile.attachmentURL)}
                    width={200}
                    height={200}
                    border={50}
                    color={[255, 255, 255, 0.6]} // RGBA
                    scale={avatarZoom}
                    rotate={avatarRotate}
                    crossOrigin ="anonymous"
                  />
                  <Row zoom>
                    <Col md={5}>
                      <CustomInput type="range" id="AvatarZoomRange" name="AvatarZoomRange" min='0.1' max='10'step="0.1" value={avatarZoom} onChange={handleAvatarZoomChange}/>
                    </Col>
                    <Col md={2}>
                      <Badge color="light">zoom:&nbsp;x{avatarZoom}</Badge>
                    </Col>
                  </Row> 
                  <Row rotate>
                    <Col md={5}>
                      <CustomInput type="range" id="AvatarRotateRange" name="AvatarRotateRange" min='0' max='360'step="1" value={avatarRotate} onChange={handleAvatarRotateChange}/>
                    </Col>
                    <Col md={2}>
                      <Badge color="light">angle:&nbsp;{avatarRotate}°</Badge>
                    </Col>
                  </Row> 
                  <br/>
                  <Input type="file" name="file" id="file" onChange={handleFileChange} />
                </CardBody>
              </Card>
            </FormGroup>
            <br/>
            <Button
              block
              color="primary"
              type="submit"
              disabled={isLoading}
            >               
              {isLoading && <Spinner as="span" color="light" />}
              &nbsp;&nbsp;Save
            </Button>
            <Button
              block
              color="secondary"
              disabled={isLoading}
              tag={Link} to="/settings"
            >               
              &nbsp;&nbsp;Cancel
            </Button>
          </Form>
          )}
        </Formik>

      )}
    </div>
  );
}